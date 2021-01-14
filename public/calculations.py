from itertools import combinations_with_replacement
from functools import partial

import json

import numpy as np
from numpy.linalg import pinv
import nlopt

def _get_response_surface(data, parameter_types):
  inputs = []
  outputs = []

  for index, parameter in enumerate(parameter_types):
    if parameter == 'input':
      inputs.append(index)
    elif parameter == 'output':
      outputs.append(index)

  response_surfaces = []

  terms = list(combinations_with_replacement(inputs, 1))
  terms.extend(combinations_with_replacement(inputs, 2))
  
  for current_output in outputs:
    A = np.ones( (data.shape[0], len(terms) + 1) )
    rhs = np.zeros( data.shape[0] )

    for i,row in enumerate(data):
      rhs[i] = row[current_output]
      for j,term in enumerate(terms):
        A[i,j+1] = row.take(term).prod()

    response_surfaces.append(pinv(A)@rhs)

  term_indices_list = list(combinations_with_replacement(range(len(inputs)), 1))
  term_indices_list.extend(combinations_with_replacement(range(len(inputs)), 2))  

  # first coefficient is the constant coefficient
  return inputs, outputs, term_indices_list, response_surfaces


def _evaluate_response_surface(term_indices_list, rs_coefficients, x, grad=None, offset=0.0):
  terms = np.ones(len(term_indices_list)+1)
  grad_terms = np.zeros( (len(x), len(term_indices_list)+1) )

  for i, term_indices in enumerate(term_indices_list):
    terms[i+1] = x.take(term_indices).prod()
    for j in range(len(x)):
      if len(term_indices) == 1 and term_indices[0] == j:
        grad_terms[j, i+1] = 1
      if len(term_indices) == 2:
        if term_indices[0] == j and term_indices[1] == j:
          grad_terms[j, i+1] = 2.0*x[j]
        elif term_indices[0] == j:
          grad_terms[j, i+1] = x[term_indices[1]]
        elif term_indices[1] == j:
          grad_terms[j, i+1] = x[term_indices[0]]

  if grad is not None and grad.size > 0:
    grad[:] = grad_terms.dot(rs_coefficients)

  return terms.dot(rs_coefficients) + offset


def get_pareto_points(data, parameters, parameter_types, parameter_options):
  data = np.array(json.loads(data))
  parameters = json.loads(parameters)
  parameter_types = json.loads(parameter_types)
  parameter_options = json.loads(parameter_options)

  # first need to define response surfaces
  inputs, outputs, term_indices_list, rs_coefficients = _get_response_surface(data, parameter_types)

  # Now get the pareto points
  return _get_pareto_points(data, inputs, outputs, parameter_options,
                            term_indices_list, rs_coefficients)


def _get_pareto_points(data, inputs, outputs, parameter_options, term_indices_list, rs_coefficients):
  opt = nlopt.opt(nlopt.LD_SLSQP, len(inputs))
  opt.set_min_objective(partial(_evaluate_response_surface, term_indices_list, rs_coefficients[0]))

  opt.set_lower_bounds(np.array([2.5, 7]))
  opt.set_upper_bounds(np.array([7.5, 15]))

  opt.add_inequality_constraint(partial(_evaluate_response_surface,
                                        term_indices_list, rs_coefficients[1],
                                        offset=-468.897287036862))

  opt.set_ftol_rel(1.0e-6)

  x0 = np.array([5, 11])

  xopt = opt.optimize(x0)

  return json.dumps(xopt.tolist())

class FuncContainer(object): pass
py_funcs = FuncContainer()
py_funcs.getParetoPoints = get_pareto_points

# pyodide returns last statement as an object that is assessable from javascript
py_funcs