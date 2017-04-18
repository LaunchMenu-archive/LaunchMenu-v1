//modified version of paullewis' https://gist.github.com/paullewis/1981455 implementation of quicksort
var Quicksort = (function(){
    /**
     * Swaps two values in the heap
     *
     * @param {int} indexA Index of the first item to be swapped
     * @param {int} indexB Index of the second item to be swapped
     */
    function swap(array, indexA, indexB) {
        var temp = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = temp;
    }

    /**
     * Partitions the (sub)array into values less than and greater
     * than the pivot value
     *
     * @param {Array} array The target array
     * @param {int} pivot The index of the pivot
     * @param {int} left The index of the leftmost element
     * @param {int} left The index of the rightmost element
     * (added by lm)
     * @param {function} func The function to base the sorting on
     */
    function partition(array, pivot, left, right, func) {
        var storeIndex = left,
        pivotValue = array[pivot];

        // put the pivot on the right
        swap(array, pivot, right);

        // go through the rest
        for(var v=left; v<right; v++) {

            // if the value is less than the pivot's
            // value put it to the left of the pivot
            // point and move the pivot point along one
            if(func(array[v],pivotValue)){
                swap(array, v, storeIndex);
                storeIndex++;
            }
        }

        // finally put the pivot in the correct place
        swap(array, right, storeIndex);

        return storeIndex;
    }

    /**
     * Sorts the (sub-)array
     *
     * @param {Array} array The target array
     * @param {int} left The index of the leftmost element, defaults 0
     * @param {int} left The index of the rightmost element, defaults array.length-1
     * 
     * (added by lm)
     * @param {int} number The amount of top items to search for
     * @param {function} func The function to base the sorting on
     */
    function sort(array, left, right, number, func) {

        var pivot = null;

        // effectively set our base
        // case here. When left == right
        // we'll stop
        if(left < right) {

            // pick a pivot between left and right
            // and update it once we've partitioned
            // the array to values < than or > than
            // the pivot value
            pivot     = left + Math.ceil((right - left) * 0.5);
            var newPivot  = partition(array, pivot, left, right, func);
    
            // recursively sort to the left and right
            sort(array, left, newPivot - 1, number, func);
            if(newPivot+1<number)
                sort(array, newPivot + 1, right, number, func);
        }
    }

    return {
        /**
         * (modified by lm)
         * Sorts the array 
         *
         * @param {Array} array The array to sort
         * @param {function} func The function to base the sorting on
         * @param {int} number The amount of top items to search for
         */
        sort: function(array, func, number){
            sort(array, 0, array.length-1, number||array.length, func||function(a,b){return a>b});
            return array;
        }
    };
})();
