import { Placement } from '@floating-ui/dom';
import { PlacementSide, PlacementAlign } from './types.mjs';

declare function isValidPlacement(v: string): v is Placement;
declare function getPlacementDetails(placement: Placement): {
    side: PlacementSide;
    align: PlacementAlign | undefined;
    hasAlign: boolean;
};
declare function getPlacementSide(placement: Placement): PlacementSide;

export { getPlacementDetails, getPlacementSide, isValidPlacement };
