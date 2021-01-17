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


def _evaluate_response_surface(term_indices_list, rs_coefficients, x, grad=None, offset=0.0,
                               factor=1.0):

  terms = np.ones(len(term_indices_list)+1)
  if grad is not None and grad.size > 0:
    grad_terms = np.zeros( (len(x), len(term_indices_list)+1) )

  for i, term_indices in enumerate(term_indices_list):
    terms[i+1] = x.take(term_indices).prod()
    if grad is not None and grad.size > 0:
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
    grad[:] = factor*grad_terms.dot(rs_coefficients)

  return factor*(terms.dot(rs_coefficients) + offset)


def get_pareto_points(data, parameters, parameter_types, parameter_options, num_pareto_points):
  data = np.array(json.loads(data))
  parameters = json.loads(parameters)
  parameter_types = json.loads(parameter_types)
  parameter_options = json.loads(parameter_options)

  # first need to define response surfaces
  inputs, outputs, term_indices_list, rs_coefficients = _get_response_surface(data, parameter_types)

  # Now get the pareto points
  x_axis_output, y_axis_output, pareto_data = _get_pareto_points(data, inputs, outputs, 
                                                                 num_pareto_points, parameter_options,
                                                                 term_indices_list, rs_coefficients)

  pareto_line = {
    'x': pareto_data[:,len(inputs)+x_axis_output].tolist(),
    'y': pareto_data[:,len(inputs)+y_axis_output].tolist(),
    'name': 'Pareto Points',
    'type': 'scatter',
    'mode': 'lines+markers'
  }

  original_points = {
    'x': data[:,outputs[x_axis_output]].tolist(),
    'y': data[:,outputs[y_axis_output]].tolist(),
    'name': 'Input Points',
    'type': 'scatter',
    'mode': 'markers'
  }

  layout = {
    'xaxis': {
      'title': parameters[outputs[x_axis_output]]
    },
    'yaxis':{
      'title': parameters[outputs[y_axis_output]]
    }
  }

  plot = {
    'data':[pareto_line, original_points],
    'layout':layout 
  }

  return json.dumps(plot)


def _get_pareto_points(data, inputs, outputs, num_pareto_points,
                       parameter_options, term_indices_list, rs_coefficients):
  
  x_axis_output = None
  y_axis_output = None
  target_outputs = []

  for i, output in enumerate(outputs):
    if parameter_options[output]['x_axis']:
      if x_axis_output is None:
        x_axis_output = i
        x_axis_goal = parameter_options[output]['goal']
      else:
        raise ValueError("Only one x-axis output can be defined.")
    elif parameter_options[output]['y_axis']:
      if y_axis_output is None:
        y_axis_output = i
        y_axis_goal = parameter_options[output]['goal']
      else:
        raise ValueError("Only one y-axis output can be defined.")
    elif parameter_options[output]['goal'] == 'target':
      target_outputs.append(i)

  if x_axis_output is None or y_axis_output is None:
    raise ValueError("One x-axis and one y-axis output need to be defined.")

  input_mins = []
  input_maxes = []

  for input in inputs:
    input_mins.append(parameter_options[input]['min'])
    input_maxes.append(parameter_options[input]['max'])

  if len(input_mins) == 0:
    raise ValueError("There must be at least one input parameter defined.")

  input_mins = np.array(input_mins)
  input_maxes = np.array(input_maxes)

  x_start = 0.5*(input_mins+input_maxes) # set a starting point at center of all input values

  # find the max and min possible x-axis values given the input variable range constraints
  opt = nlopt.opt(nlopt.LD_SLSQP, len(inputs))
  opt.set_min_objective(partial(_evaluate_response_surface, term_indices_list,
                                rs_coefficients[x_axis_output]))
  opt.set_lower_bounds(input_mins)
  opt.set_upper_bounds(input_maxes)
  opt.set_ftol_rel(1.0e-12)

  # find xmin
  xopt = opt.optimize(x_start)

  xmin = _evaluate_response_surface(term_indices_list, rs_coefficients[x_axis_output], xopt)

  opt.set_max_objective(partial(_evaluate_response_surface, term_indices_list,
                                rs_coefficients[x_axis_output]))

  # find xmax
  xopt = opt.optimize(x_start)

  xmax = _evaluate_response_surface(term_indices_list, rs_coefficients[x_axis_output], xopt)

  x_targets = np.linspace(xmin, xmax, num_pareto_points)

  pareto_designs = None

  opt = nlopt.opt(nlopt.LD_SLSQP, len(inputs))
  opt_global = nlopt.opt(nlopt.GN_ISRES, len(inputs))

  if y_axis_goal == "minimize":
    opt.set_min_objective(partial(_evaluate_response_surface, term_indices_list,
                                  rs_coefficients[y_axis_output]))
    opt_global.set_min_objective(partial(_evaluate_response_surface, term_indices_list,
                                        rs_coefficients[y_axis_output]))
  else:
    opt.set_max_objective(partial(_evaluate_response_surface, term_indices_list,
                                  rs_coefficients[y_axis_output]))
    opt_global.set_max_objective(partial(_evaluate_response_surface, term_indices_list,
                                         rs_coefficients[y_axis_output]))

  for target_output in target_outputs:
    opt.add_equality_constraint(_evaluate_response_surface,
                                term_indices_list, rs_coefficients[target_output],
                                offset=-parameter_options[outputs[target_output]]['target'])
    opt_global.add_equality_constraint(_evaluate_response_surface,
                                term_indices_list, rs_coefficients[target_output],
                                offset=-parameter_options[outputs[target_output]]['target'])

  opt.set_lower_bounds(input_mins)
  opt_global.set_lower_bounds(input_mins)
  
  opt.set_upper_bounds(input_maxes)
  opt_global.set_upper_bounds(input_maxes)

  # opt.set_ftol_rel(1.0e-12)
  # opt.set_xtol_rel(1.0e-12)
  opt_global.set_maxeval(500)

  for x_target in x_targets:
    opt.remove_inequality_constraints()
    opt_global.remove_inequality_constraints()

    sign = 1.0 if x_axis_goal == "minimize" else -1.0
    opt.add_inequality_constraint(partial(_evaluate_response_surface,
                                          term_indices_list, rs_coefficients[x_axis_output],
                                          offset=-x_target, factor=sign))
    opt_global.add_inequality_constraint(partial(_evaluate_response_surface,
                                                 term_indices_list, rs_coefficients[x_axis_output],
                                                 offset=-x_target, factor=sign))

    xopt_global = opt_global.optimize(x_start) # start with a global search to get a good starting point
    xopt = opt.optimize(xopt_global) # finish up with the gradient based search
    # xopt = xopt_global

    opt_outputs = []
    for i, output in enumerate(outputs):
      opt_outputs.append(_evaluate_response_surface(term_indices_list, rs_coefficients[i], xopt))

    if pareto_designs is None:
      pareto_designs = np.hstack((xopt, np.array(opt_outputs)))
    else:
      pareto_designs = np.vstack((pareto_designs, np.hstack((xopt, np.array(opt_outputs)))))

    # gradient checking code, ideally should be made into a test
    # for i in range(10):
    #   grad = np.zeros(len(inputs))
    #   point = np.random.uniform(low=2.0, high=15.0, size=len(inputs))
    #   value = _evaluate_response_surface(term_indices_list, rs_coefficients[0], point, offset=150.0, grad=grad, factor=-1.0)

    #   fd_grad = np.zeros(len(inputs))
    #   h = 1e-6
    #   for i in range(len(inputs)):
    #     delta = np.zeros(len(inputs))
    #     delta[i] = h
    #     fd_grad[i] = (_evaluate_response_surface(term_indices_list, rs_coefficients[0], point+delta, offset=150.0, factor=-1.0)-
    #                   _evaluate_response_surface(term_indices_list, rs_coefficients[0], point-delta, offset=150.0, factor=-1.0))/(2*h)

    #   print('analytical grad:',grad)
    #   print('fd grad:', fd_grad)
    #   print('difference', np.linalg.norm(fd_grad-grad))

  return x_axis_output, y_axis_output, pareto_designs

class FuncContainer(object): pass
py_funcs = FuncContainer()
py_funcs.getParetoPoints = get_pareto_points

# pyodide returns last statement as an object that is assessable from javascript
py_funcs