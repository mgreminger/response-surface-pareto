from itertools import combinations_with_replacement

import numpy as np
from numpy.linalg import pinv
import nlopt

def get_response_surface(data, parameter_types):
  data = np.array(data)

  inputs = []
  outputs = []

  for index, parameter in enumerate(parameter_types):
    if parameter_types['name'] == 'input':
      inputs.append(index)
    elif parameter_types['name'] == 'output':
      outputs.append(index)

  response_surfaces = []

  for current_input in inputs:
    terms = list(combinations_with_replacement(inputs, 1))
    terms.extend(combinations_with_replacement(inputs,2))

    A = np.ones( (data.shape[0], len(terms) + 1) )
    rhs = np.zeros( data.shape[0] )

    for i,row in enumerate(data):
      rhs[i] = row[current_input]
      for j,term in enumerate(terms):
        if len(term) == 1:
          A[i,j+1] = row[term[0]]
        else:
          A[i,j+1] = row[term[0]*term[1]]

    response_surfaces.append(pinv(A)@rhs)
    
  return response_surfaces




def get_pareto_points(data, parameter_types, parameter_options, response_coefficients):
  pass


class FuncContainer(object): pass
py_funcs = FuncContainer()
py_funcs.get_response_surface = get_response_surface
py_funcs.get_pareto_points = get_pareto_points

py_funcs