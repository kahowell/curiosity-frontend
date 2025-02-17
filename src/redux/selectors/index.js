import appMessagesSelectors from './appMessagesSelectors';
import guestsListSelectors from './guestsListSelectors';
import graphCardSelectors from './graphCardSelectors';
import inventoryListSelectors from './inventoryListSelectors';
import instancesListSelectors from './instancesListSelectors';
import subscriptionsListSelectors from './subscriptionsListSelectors';
import userSelectors from './userSelectors';

const reduxSelectors = {
  appMessages: appMessagesSelectors,
  guestsList: guestsListSelectors,
  graphCard: graphCardSelectors,
  inventoryList: inventoryListSelectors,
  instancesList: instancesListSelectors,
  subscriptionsList: subscriptionsListSelectors,
  user: userSelectors
};

export { reduxSelectors as default, reduxSelectors };
