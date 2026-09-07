import { NodeState } from '@zag-js/tree-view';
import { Provider } from 'react';
export interface UseTreeViewNodeContext extends NodeState {
}
export declare const TreeViewNodeStateProvider: Provider<UseTreeViewNodeContext>, useTreeViewNodeContext: () => UseTreeViewNodeContext;
