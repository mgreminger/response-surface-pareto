from itertools import combinations_with_replacement
from functools import partial

import json

import numpy as np
from numpy.linalg import pinv
from trust_constr import minimize, NonlinearConstraint, Bounds


def _get_response_surface(data, parameter_types):
    inputs = []
    outputs = []

    for index, parameter in enumerate(parameter_types):
        if parameter == "input":
            inputs.append(index)
        elif parameter == "output":
            outputs.append(index)

    response_surfaces = []

    terms = list(combinations_with_replacement(inputs, 1))
    terms.extend(combinations_with_replacement(inputs, 2))

    for current_output in outputs:
        A = np.ones((data.shape[0], len(terms) + 1))
        rhs = np.zeros(data.shape[0])

        for i, row in enumerate(data):
            rhs[i] = row[current_output]
            for j, term in enumerate(terms):
                A[i, j + 1] = row.take(term).prod()

        response_surfaces.append(pinv(A) @ rhs)

    term_indices_list = list(combinations_with_replacement(range(len(inputs)), 1))
    term_indices_list.extend(combinations_with_replacement(range(len(inputs)), 2))

    # first coefficient is the constant coefficient
    return inputs, outputs, term_indices_list, response_surfaces


def _evaluate_response_surface(
    term_indices_list, rs_coefficients, x, factor=1.0, offset=0.0
):
    terms = np.ones(len(term_indices_list) + 1)

    for i, term_indices in enumerate(term_indices_list):
        terms[i + 1] = x.take(term_indices).prod()

    return factor * (terms.dot(rs_coefficients) + offset)


def _evaluate_response_surface_grad(
    term_indices_list, rs_coefficients, x, factor=1.0, offset=0.0, zeroed_comps=None
):

    grad_terms = np.zeros((len(x), len(term_indices_list) + 1))

    for i, term_indices in enumerate(term_indices_list):
        for j in range(len(x)):
            if len(term_indices) == 1 and term_indices[0] == j:
                grad_terms[j, i + 1] = 1.0
            if len(term_indices) == 2:
                if term_indices[0] == j and term_indices[1] == j:
                    grad_terms[j, i + 1] = 2.0 * x[j]
                elif term_indices[0] == j:
                    grad_terms[j, i + 1] = x[term_indices[1]]
                elif term_indices[1] == j:
                    grad_terms[j, i + 1] = x[term_indices[0]]

    grad = factor * grad_terms.dot(rs_coefficients)

    if zeroed_comps is not None:
        grad[np.nonzero(zeroed_comps)] = 0

    return grad 


def get_pareto_points(
    data, parameters, parameter_types, parameter_options, num_pareto_points
):
    data = np.array(json.loads(data))
    parameters = json.loads(parameters)
    parameter_types = json.loads(parameter_types)
    parameter_options = json.loads(parameter_options)

    # first need to define response surfaces
    inputs, outputs, term_indices_list, rs_coefficients = _get_response_surface(
        data, parameter_types
    )

    # Now get the pareto points
    x_axis_output, y_axis_output, pareto_data = _get_pareto_points(
        data,
        inputs,
        outputs,
        num_pareto_points,
        parameter_options,
        term_indices_list,
        rs_coefficients,
    )


    hovertemplate = ""
    headers = []
    for i, input in enumerate(inputs):
        headers.append(parameters[input])
        if hovertemplate == "":
            hovertemplate = f"{parameters[input]}: %{{customdata[{i}]:.3g}}"
        else:
            hovertemplate += f"<br>{parameters[input]}: %{{customdata[{i}]:.3g}}"
    
    for i, output in enumerate(outputs):
        headers.append(parameters[output])
        hovertemplate += f"<br>{parameters[output]}: %{{customdata[{len(inputs)+i}]:.3g}}"

    pareto_line = {
        "x": pareto_data[:, len(inputs) + x_axis_output].tolist(),
        "y": pareto_data[:, len(inputs) + y_axis_output].tolist(),
        "customdata": pareto_data.tolist(),
        "name": "Pareto Points",
        "type": "scatter",
        "mode": "lines+markers",
        "hovertemplate": hovertemplate
    }

    original_points = {
        "x": data[:, outputs[x_axis_output]].tolist(),
        "y": data[:, outputs[y_axis_output]].tolist(),
        "customdata": np.hstack( (data[:,inputs], data[:,outputs]) ).tolist(),
        "name": "Input Points",
        "type": "scatter",
        "mode": "markers",
        "hovertemplate": hovertemplate
    }

    layout = {
        "title": "Response Surface Pareto Plot",
        "hovermode": "closest",
        "xaxis": {"title": parameters[outputs[x_axis_output]]},
        "yaxis": {"title": parameters[outputs[y_axis_output]]},
    }

    plot = {"data": [pareto_line, original_points], "layout": layout}

    pareto_dict = {'headers': headers, 'data': pareto_data.tolist()}

    return json.dumps({'plot':plot, 'data':pareto_dict})


def _get_pareto_points(
    data,
    inputs,
    outputs,
    num_pareto_points,
    parameter_options,
    terms,
    response_surfaces,
):

    x_axis_output = None
    y_axis_output = None
    target_outputs = []

    for i, output in enumerate(outputs):
        if parameter_options[output]["x_axis"]:
            if x_axis_output is None:
                x_axis_output = i
                x_axis_goal = parameter_options[output]["goal"]
            else:
                raise ValueError("Only one x-axis output can be defined.")
        elif parameter_options[output]["y_axis"]:
            if y_axis_output is None:
                y_axis_output = i
                y_axis_goal = parameter_options[output]["goal"]
            else:
                raise ValueError("Only one y-axis output can be defined.")
        elif parameter_options[output]["goal"] == "target":
            target_outputs.append(i)

    if x_axis_output is None or y_axis_output is None:
        raise ValueError("One x-axis and one y-axis output need to be defined.")

    input_mins = []
    input_maxes = []

    for input in inputs:
        input_mins.append(parameter_options[input]["min"])
        input_maxes.append(parameter_options[input]["max"])

    if len(input_mins) == 0:
        raise ValueError("There must be at least one input parameter defined.")

    input_mins = np.array(input_mins)
    input_maxes = np.array(input_maxes)

    zeroed_comps = (input_maxes - input_mins) == 0

    if np.count_nonzero(np.invert(zeroed_comps)) < 1:
        raise ValueError("There must be at least one input parameter that is not fixed.")

    bounds = Bounds(input_mins, input_maxes)

    # set a starting point at center of all input values
    x0 = 0.5 * (
        input_mins + input_maxes
    )

    # add equality constraints for any outputs with targets
    constraints = []
    for target_output in target_outputs:
        constraints.append(
            NonlinearConstraint(
                partial(_evaluate_response_surface, terms, response_surfaces[target_output]),
                parameter_options[outputs[target_output]]["target"],
                parameter_options[outputs[target_output]]["target"],
                jac=partial(
                    _evaluate_response_surface_grad, terms, response_surfaces[target_output],
                    zeroed_comps=zeroed_comps
                ),
            )
        )

    def objective_func(x, index, sign=1.0):
        return _evaluate_response_surface(
            terms, response_surfaces[index], x, factor=sign
        )

    def objective_func_grad(x, index, sign=1.0):
        return _evaluate_response_surface_grad(
            terms, response_surfaces[index], x, factor=sign, zeroed_comps=zeroed_comps
        )

    # find the max and min possible x-axis values given the input variable range constraints
    res = minimize(
        objective_func,
        x0,
        jac=objective_func_grad,
        args=(x_axis_output, -1.0),
        bounds=bounds,
        constraints=constraints,
        options={"disp": False},
    )
    x_max = -res.fun

    # x_min_starting_point = X[y[:,x_axis_index].argmin(),:]
    res = minimize(
        objective_func,
        x0,
        jac=objective_func_grad,
        args=(x_axis_output, 1.0),
        bounds=bounds,
        constraints=constraints,
        options={"disp": False},
    )
    x_min = res.fun

    x_targets = np.linspace(x_min, x_max, num_pareto_points)

    pareto_designs = None

    if y_axis_goal == "minimize":
        y_axis_sign = 1
    else:
        y_axis_sign = -1

    for x_value in x_targets:
        if x_axis_goal == "minimize":
            limits = (-np.inf, x_value)
        else:
            limits = (x_value, np.inf)

        current_constraint = NonlinearConstraint(
            partial(_evaluate_response_surface, terms, response_surfaces[x_axis_output]),
            *limits,
            jac=partial(
                _evaluate_response_surface_grad, terms, response_surfaces[x_axis_output],
                zeroed_comps = zeroed_comps
            )
        )

        res = minimize(
            objective_func,
            x0,
            args=(y_axis_output, y_axis_sign),
            bounds=bounds,
            constraints=constraints + [current_constraint,],
            jac=objective_func_grad,
            options={"disp": False},
        )

        opt_outputs = []
        for i, output in enumerate(outputs):
            opt_outputs.append(
                _evaluate_response_surface(terms, response_surfaces[i], res.x)
            )

        if pareto_designs is None:
            pareto_designs = np.hstack((res.x, np.array(opt_outputs)))
        else:
            pareto_designs = np.vstack(
                (pareto_designs, np.hstack((res.x, np.array(opt_outputs))))
            )

    return x_axis_output, y_axis_output, pareto_designs


class FuncContainer(object):
    pass


py_funcs = FuncContainer()
py_funcs.getParetoPoints = get_pareto_points

# pyodide returns last statement as an object that is assessable from javascript
py_funcs
