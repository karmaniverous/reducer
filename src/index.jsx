// npm imports
import { posix } from 'path';
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useMemo } from 'react';

const ReducerContext = createContext({});

export const useReducer = () => {
  const parentContext = useContext(ReducerContext);
  return parentContext;
};

const Reducer = ({
  active: thisActive,
  context: thisContext,
  name,
  onAfterReduce,
  onBeforeReduce,
  reductions,
  render,
  state: thisState,
  updater: thisUpdater,
}) => {
  const {
    active: parentActive,
    context: parentContext,
    reducerPath: parentPath,
    reduce: parentReduce,
    state: parentState,
    updater: parentUpdater,
  } = useReducer();

  const active = useMemo(
    () => thisActive ?? parentActive,
    [parentActive, thisActive]
  );

  const context = useMemo(
    () =>
      Object.assign({ ...(parentContext ?? {}) }, { ...(thisContext ?? {}) }),
    [parentContext, thisContext]
  );

  const reducerPath = useMemo(
    () => `${parentPath ?? '/'}${name}/`,
    [parentPath]
  );

  console.log(reducerPath, parentContext, thisContext, context);

  const state = useMemo(
    () => thisState ?? parentState,
    [parentState, thisState]
  );

  const updater = useMemo(
    () => thisUpdater ?? parentUpdater,
    [parentUpdater, thisUpdater]
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
      posix
        .resolve(reducerPath, path)
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

      if (parentReduce) parentReduce(getValue('../'));
    },
    [
      active,
      parentReduce,
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
    if (!(active && parentReduce)) return;

    const parentValue = getValue('../');

    delete parentValue[name];

    parentReduce(parentValue);
  }, [active, parentReduce, getValue]);

  const setValue = useCallback(
    (value, path) => (getNode(path).value = value),
    [getNode]
  );

  return (
    <ReducerContext.Provider
      value={{
        active,
        addChild,
        context,
        getNode,
        getReduction,
        getValue,
        reduce,
        reducerPath,
        remove,
        setValue,
        state,
        updater,
      }}
    >
      {render({
        addChild,
        context,
        getReduction,
        getValue,
        reduce,
        remove,
        setValue,
      })}
    </ReducerContext.Provider>
  );
};

Reducer.propTypes = {
  active: PropTypes.bool,
  context: PropTypes.object,
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
