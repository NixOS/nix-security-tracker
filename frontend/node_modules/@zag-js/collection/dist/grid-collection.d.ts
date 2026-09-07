import { ListCollection } from './list-collection.js';
import { CollectionItem, CollectionOptions } from './types.js';

interface GridCollectionOptions<T> extends CollectionOptions<T> {
    columnCount: number;
}
declare class GridCollection<T extends CollectionItem = CollectionItem> extends ListCollection<T> {
    columnCount: number;
    private rows;
    constructor(options: GridCollectionOptions<T>);
    /**
     * Returns the row data in the grid
     */
    getRows: () => T[][];
    /**
     * Returns the number of rows in the grid
     */
    getRowCount: () => number;
    /**
     * Returns the index of the specified row and column in the grid
     */
    getCellIndex: (row: number, column: number) => number;
    /**
     * Returns the item at the specified row and column in the grid
     */
    getCell: (row: number, column: number) => T | null;
    /**
     * Returns the row and column index for a given value
     */
    getValueCell: (value: string) => {
        row: number;
        column: number;
    } | null;
    /**
     * Returns the value of the last enabled column in a row
     */
    getLastEnabledColumnIndex: (row: number) => number | null;
    /**
     * Returns the index of the first enabled column in a row
     */
    getFirstEnabledColumnIndex: (row: number) => number | null;
    /**
     * Returns the value of the previous row in the grid, based on the current value
     */
    getPreviousRowValue: (value: string, loop?: boolean) => string | null;
    /**
     * Returns the value of the next row in the grid, based on the current value
     */
    getNextRowValue: (value: string, loop?: boolean) => string | null;
}
declare function isGridCollection(v: any): v is GridCollection<any>;

export { GridCollection, type GridCollectionOptions, isGridCollection };
