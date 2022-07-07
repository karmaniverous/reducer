// npm imports
import { resolve } from 'path';
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useMemo } from 'react';

export const ReducerContext = createContext({});

const Reducer = ({
  active: thisActive,
  name,
  onAfterReduce,
  onBeforeReduce,
  reductions,
  render,
  state: thisState,
  updater: thisUpdater,
}) => {
  const {
    active: contextActive,
    reducerPath: contextReducerPath,
    reduce: contextReduce,
    state: contextState,
    updater: contextUpdater,
  } = useContext(ReducerContext);

  const active = useMemo(
    () => thisActive ?? contextActive,
    [contextActive, thisActive]
  );

  const reducerPath = useMemo(
    () => `${contextReducerPath ?? '/'}${name}/`,
    [contextReducerPath]
  );

  const state = useMemo(
    () => thisState ?? contextState,
    [contextState, thisState]
  );

  const updater = useMemo(
    () => thisUpdater ?? contextUpdater,
    [contextUpdater, thisUpdater]
  );

  const doUpdate = useCallback(
    (state) => {
      // console.log('doUpdate', name, state);
      updater(state);
    },
    [updater]
  );

  const addChild = useCallback(
    (token, value, path = '') => {
      if (!active) return;

      const nodeValue = getValue();

      const parentValue = getValue(path);

      parentValue[token] = { value };

      reduce(nodeValue);
    },
    // State isn't a direct dependency but seems necessary to get this to work.
    [active, getValue, state]
  );

  const getNode = useCallback(
    (path = '') =>
      resolve(reducerPath, path)
        .split('/')
        .filter((n) => n !== '')
        .reduce(
          (s, n) => (typeof s?.value === 'object' ? s.value[n] : undefined),
          state
        ),
    [reducerPath, state]
  );

  const getReduction = useCallback(
    (reduction, path) => {
      const reductions = getNode(path)?.reductions;
      return typeof reductions === 'object' ? reductions[reduction] : undefined;
    },
    [getNode]
  );

  const getValue = useCallback((path) => getNode(path)?.value, [getNode]);

  const reduce = useCallback(
    (value) => {
      if (!active) return;

      const node = getNode();
      if (node === undefined) return;

      node.value = value;

      if (onBeforeReduce)
        onBeforeReduce({ getNode, getReduction, getValue, setValue });

      node.reductions = Object.keys(reductions ?? {}).reduce(
        (reductionsObj, k) => {
          const { default: defaultValue, test, reducers } = reductions[k];
          return {
            ...reductionsObj,
            [k]: (reducers ?? []).reduce(
              (reductionObj, { context, reducer }) => {
                if (
                  typeof test === 'function'
                    ? test(reductionObj.value)
                    : reductionObj.value === test
                )
                  return reductionObj;

                const reducerValue =
                  typeof reducer === 'function'
                    ? reducer({ getReduction, getValue })
                    : value === reducer;

                if (
                  typeof test === 'function'
                    ? !test(reducerValue)
                    : reducerValue !== test
                )
                  return reductionObj;

                return {
                  value: reducerValue,
                  context,
                };
              },
              { value: defaultValue }
            ),
          };
        },
        {}
      );

      if (onAfterReduce)
        onAfterReduce({ getNode, getReduction, getValue, setValue });

      doUpdate({ ...state });

      if (contextReduce) contextReduce(getValue('../'));
    },
    [
      active,
      contextReduce,
      getNode,
      getReduction,
      getValue,
      onAfterReduce,
      onBeforeReduce,
      state,
      doUpdate,
    ]
  );

  const remove = useCallback(() => {
    if (!(active && contextReduce)) return;

    const parentValue = getValue('../');

    delete parentValue[name];

    contextReduce(parentValue);
  }, [active, contextReduce, getValue]);

  const setValue = useCallback(
    (value, path) => (getNode(path).value = value),
    [getNode]
  );

  return (
    <ReducerContext.Provider
      value={{
        active,
        addChild,
        getNode,
        getReduction,
        getValue,
        reducerPath,
        reduce,
        remove,
        setValue,
        state,
        updater: doUpdate,
      }}
    >
      {render({ addChild, getReduction, getValue, reduce, remove, setValue })}
    </ReducerContext.Provider>
  );
};

Reducer.propTypes = {
  active: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onAfterReduce: PropTypes.func,
  onBeforeReduce: PropTypes.func,
  reductions: PropTypes.object,
  render: PropTypes.func.isRequired,
  state: PropTypes.object,
  updater: PropTypes.func,
};

export default Reducer;

export const decodeReducerData = (data) => {
  const decode = (d) =>
    Object.prototype.toString.call(d?.value) === '[object Object]'
      ? Object.keys(d.value).reduce(
          (v, k) => ({
            ...v,
            [k]: decode(d.value[k]),
          }),
          {}
        )
      : d?.value;

  return decode(data);
};

export const encodeReducerData = (data) => {
  const encode = (d) => ({
    value:
      Object.prototype.toString.call(d) === '[object Object]'
        ? Object.keys(d).reduce(
            (v, k) => ({
              ...v,
              [k]: encode(d[k]),
            }),
            {}
          )
        : d,
  });

  return encode(data);
};
