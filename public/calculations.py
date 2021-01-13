from itertools import combinations_with_replacement
from functools import partial

import json

import numpy as np
from numpy.linalg import pinv
import nlopt

def get_response_surface(data, parameter_types):
  data = json.loads(data)
  parameter_types = json.loads(parameter_types)
  
  data = np.array(data)

  inputs = []
  outputs = []

  for index, parameter in enumerate(parameter_types):
    if parameter['name'] == 'input':
      inputs.append(index)
    elif parameter['name'] == 'output':
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
  return term_indices_list, response_surfaces


def evaluate_response_surface(term_indices_list, rs_coefficients, x, grad=None, offset=0.0):
  terms = np.array.ones(len(term_indices_list)+1)
  grad_terms = np.array.zeros( (len(x), len(term_indices_list)+1) )

  for i, term_indices in enumerate(term_indices_list):
    terms[i+1] = x.take(term_indices).prod()
    for j in range(len(x)):
      if len(term_indices) == 1 and term_indices[0] == j:
        grad_terms[i, j+1] = 1
      if len(term_indices) == 2:
        if term_indices[0] == j and term_indices[1] == j:
          grad_terms[i, j+1] = 2.0*x[j]
        elif term_indices[0] == j:
          grad_terms[i, j+1] = x[term_indices[1]]
        elif term_indices[1] == j:
          grad_terms[i, j+1] = x[term_indices[0]]

  if grad and grad.size > 0:
    grad[:] = grad_terms.dot(rs_coefficients)

  return terms.dot(rs_coefficients) + offset


def get_pareto_points(data, parameter_types, parameter_options, term_indices, rs_coefficients):
  pass


class FuncContainer(object): pass
py_funcs = FuncContainer()
py_funcs.get_response_surface = get_response_surface
py_funcs.get_pareto_points = get_pareto_points

py_funcs