import React, { useCallback, useContext } from 'react';
import { reduxHelpers } from '../../redux/common';
import { storeHooks } from '../../redux/hooks';
import { RHSM_API_QUERY_TYPES, rhsmApiTypes } from '../../types/rhsmApiTypes';
import { helpers } from '../../common/helpers';

/**
 * Route context.
 *
 * @type {React.Context<{}>}
 */
const DEFAULT_CONTEXT = [{}, helpers.noop];

const ProductViewContext = React.createContext(DEFAULT_CONTEXT);

/**
 * Get an updated product view context.
 *
 * @returns {React.Context<{}>}
 */
const useProductViewContext = () => useContext(ProductViewContext);

/**
 * Return a query object from initial product config and Redux store.
 *
 * @param {string} queryType An identifier used to pull from both config and Redux, they should named the same.
 * @param {object} options
 * @param {object} options.useProductViewContext
 * @returns {object}
 */
const useProductQueryFactory = (
  queryType,
  { useProductViewContext: useAliasProductViewContext = useProductViewContext } = {}
) => {
  const { [queryType]: initialQuery, productId, viewId } = useAliasProductViewContext();
  const queryProduct = storeHooks.reactRedux.useSelector(({ view }) => view?.[queryType]?.[productId], undefined);
  const queryView = storeHooks.reactRedux.useSelector(({ view }) => view?.[queryType]?.[viewId], undefined);

  return {
    ...initialQuery,
    ...queryProduct,
    ...queryView
  };
};

/**
 * Return a base product query
 *
 * @param {object} options
 * @param {string} options.queryType
 * @param {object} options.options
 * @returns {object}
 */
const useProductQuery = ({ queryType = 'query', options } = {}) => useProductQueryFactory(queryType, options);

/**
 * Return the graph query based off of tally and capacity.
 *
 * @param {object} options
 * @param {string} options.queryType
 * @param {object} options.schemaCheck
 * @param {object} options.options
 * @returns {object}
 */
const useProductGraphTallyQuery = ({
  queryType = 'graphTallyQuery',
  schemaCheck = rhsmApiTypes.RHSM_API_QUERY_SET_REPORT_CAPACITY_TYPES,
  options
} = {}) =>
  reduxHelpers.setApiQuery(
    {
      ...useProductQuery(),
      ...useProductQueryFactory(queryType, options)
    },
    schemaCheck
  );

/**
 * Return the inventory query for guests.
 *
 * @param {object} options
 * @param {string} options.queryType
 * @param {object} options.schemaCheck
 * @param {object} options.options
 * @returns {object}
 */
const useProductInventoryGuestsQuery = ({
  queryType = 'inventoryGuestsQuery',
  schemaCheck = rhsmApiTypes.RHSM_API_QUERY_SET_INVENTORY_GUESTS_TYPES,
  options
} = {}) =>
  reduxHelpers.setApiQuery(
    {
      ...useProductQuery(),
      ...useProductQueryFactory(queryType, options)
    },
    schemaCheck
  );

/**
 * Return an inventory query for hosts.
 *
 * @param {object} options
 * @param {string} options.queryType
 * @param {object} options.schemaCheck
 * @param {object} options.options
 * @returns {object}
 */
const useProductInventoryHostsQuery = ({
  queryType = 'inventoryHostsQuery',
  schemaCheck = rhsmApiTypes.RHSM_API_QUERY_SET_INVENTORY_TYPES,
  options
} = {}) =>
  reduxHelpers.setApiQuery(
    {
      ...useProductQuery(),
      ...useProductQueryFactory(queryType, options)
    },
    schemaCheck
  );

/**
 * Return an inventory query for subscriptions.
 *
 * @param {object} options
 * @param {string} options.queryType
 * @param {object} options.schemaCheck
 * @param {object} options.options
 * @returns {object}
 */
const useProductInventorySubscriptionsQuery = ({
  queryType = 'inventorySubscriptionsQuery',
  schemaCheck = rhsmApiTypes.RHSM_API_QUERY_SET_INVENTORY_TYPES,
  options
} = {}) =>
  reduxHelpers.setApiQuery(
    {
      ...useProductQuery(),
      ...useProductQueryFactory(queryType, options)
    },
    schemaCheck
  );

/**
 * Get a filtered product configuration context.
 *
 * @param {object} options
 * @param {Function} options.useProductQuery
 * @param {Function} options.useProductViewContext
 * @returns {object}
 */
const useProductContext = ({
  useProductQuery: useAliasProductQuery = useProductQuery,
  useProductViewContext: useAliasProductViewContext = useProductViewContext
} = {}) => {
  const { [RHSM_API_QUERY_TYPES.UOM]: uomFilter } = useAliasProductQuery();
  const {
    initialGraphFilters = [],
    initialInventoryFilters = [],
    initialSubscriptionsInventoryFilters = [],
    productContextFilterUom,
    ...config
  } = useAliasProductViewContext();

  const applyUomFilter = useCallback(() => {
    if (productContextFilterUom === true) {
      const filterFilters = ({ id, isOptional }) => {
        if (!isOptional) {
          return true;
        }
        return new RegExp(uomFilter, 'i').test(id);
      };

      return {
        ...config,
        initialGraphFilters: initialGraphFilters.filter(filterFilters),
        initialInventoryFilters: initialInventoryFilters.filter(filterFilters),
        initialSubscriptionsInventoryFilters: initialSubscriptionsInventoryFilters.filter(filterFilters)
      };
    }

    return {
      ...config,
      initialGraphFilters,
      initialInventoryFilters,
      initialSubscriptionsInventoryFilters
    };
  }, [
    config,
    initialGraphFilters,
    initialInventoryFilters,
    initialSubscriptionsInventoryFilters,
    productContextFilterUom,
    uomFilter
  ]);

  return applyUomFilter();
};

/**
 * Return product identifiers.
 *
 * @param {object} options
 * @param {Function} options.useProductViewContext
 * @returns {{productLabel: string, viewId: string, productId: string, productGroup: string}}
 */
const useProduct = ({ useProductViewContext: useAliasProductViewContext = useProductViewContext } = {}) => {
  const { productGroup, productId, productLabel, viewId } = useAliasProductViewContext();
  return {
    productGroup,
    productId,
    productLabel,
    viewId
  };
};

/**
 * Return graph configuration.
 *
 * @param {object} options
 * @param {Function} options.useProductContext
 * @returns {{settings: object, filters: Array}}
 */
const useProductGraphConfig = ({ useProductContext: useAliasProductContext = useProductContext } = {}) => {
  const { initialGraphFilters, initialGraphSettings = {} } = useAliasProductContext();
  return {
    filters: initialGraphFilters,
    settings: initialGraphSettings
  };
};

/**
 * Return hosts inventory configuration.
 *
 * @param {object} options
 * @param {Function} options.useProductContext
 * @returns {{settings: object, filters: Array}}
 */
const useProductInventoryHostsConfig = ({ useProductContext: useAliasProductContext = useProductContext } = {}) => {
  const { initialInventoryFilters, initialInventorySettings = {} } = useAliasProductContext();
  return {
    filters: initialInventoryFilters,
    settings: initialInventorySettings
  };
};

/**
 * Return subscriptions inventory configuration.
 *
 * @param {object} options
 * @param {Function} options.useProductContext
 * @returns {{settings: object, filters: Array}}
 */
const useProductInventorySubscriptionsConfig = ({
  useProductContext: useAliasProductContext = useProductContext
} = {}) => {
  const { initialSubscriptionsInventoryFilters, initialSubscriptionsInventorySettings = {} } = useAliasProductContext();
  return {
    filters: initialSubscriptionsInventoryFilters,
    settings: initialSubscriptionsInventorySettings
  };
};

/**
 * Return primary toolbar configuration.
 *
 * @param {object} options
 * @param {Function} options.useProductContext
 * @returns {{settings: object, filters: Array}}
 */
const useProductToolbarConfig = ({ useProductContext: useAliasProductContext = useProductContext } = {}) => {
  const { initialToolbarFilters, initialToolbarSettings = {} } = useAliasProductContext();
  return {
    filters: initialToolbarFilters,
    settings: initialToolbarSettings
  };
};

const context = {
  ProductViewContext,
  DEFAULT_CONTEXT,
  useProductContext,
  useQuery: useProductQuery,
  useQueryFactory: useProductQueryFactory,
  useGraphTallyQuery: useProductGraphTallyQuery,
  useInventoryGuestsQuery: useProductInventoryGuestsQuery,
  useInventoryHostsQuery: useProductInventoryHostsQuery,
  useInventorySubscriptionsQuery: useProductInventorySubscriptionsQuery,
  useProduct,
  useGraphConfig: useProductGraphConfig,
  useInventoryHostsConfig: useProductInventoryHostsConfig,
  useInventorySubscriptionsConfig: useProductInventorySubscriptionsConfig,
  useToolbarConfig: useProductToolbarConfig
};

export {
  context as default,
  context,
  ProductViewContext,
  DEFAULT_CONTEXT,
  useProductContext,
  useProductQuery,
  useProductQueryFactory,
  useProductGraphTallyQuery,
  useProductInventoryGuestsQuery,
  useProductInventoryHostsQuery,
  useProductInventorySubscriptionsQuery,
  useProduct,
  useProductGraphConfig,
  useProductInventoryHostsConfig,
  useProductInventorySubscriptionsConfig,
  useProductToolbarConfig
};
