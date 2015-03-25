//https://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects

(function () {
    var NativeMap = window.Map;
    var NativeSet = window.Set;

    var toString = Object.prototype.toString;
    var defineProperty = Object.defineProperty;
    var defineProperties = Object.defineProperties;
    
    function toStringTag(object) {
        return toString.call(object).slice(8, -1);
    }
    
    function def(obj, props) {
        for (var x in props) {
            if(!obj.hasOwnProperty(x)) {}
            defineProperty(obj, x, {
                value: props[x],
                writeable: true
            })
        }
        return obj;
    }
    
    function toInt(val) {
        return val >> 0;
    }
    
    function toLen(val) {
        return val >= 0 ? val >> 0 : 0;
    }
    
    function getClass(object) {
        return toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    }

    var isArray = Array.isArray;

    function isArrayLike(object) {
        return object.length && typeof object.length === 'number';
    }

    function isFn(fn) {
        return typeof fn === 'function' || toStringTag(fn) === 'Function';
    }
    
    function isDef(val) {
        return typeof val !== 'undefinied';
    }

    function isMap(map) {
        return map instanceof Map || toStringTag(map) === 'Map';
    }

    function isSet(set) {
        return set instanceof Set || toStringTag(map) === 'Set';
    }

    function isStr(object) {
        return typeof object === "string";
    }

    function isCollection(object) {
        return (isMap(object) || isSet(object)) && isFn(object.forEach);
    }

    function isPlain(object) {
        return toStringTag(object) === 'Object';
    }

    function isIterator(object) {
        var tag = toStringTag(object);
        return tag === 'Set Iterator' || tag === 'Map Iterator' || tag === 'Array Iterator' || tag === 'Iterator'
            || (object && isFn(object.next));
    }

    function isEntry(object) {
        var type = typeof object;
        return type !== 'number' && type !== 'string';
    }

    function isNull(object) {
        return object == null;
    }

    function isEntryOrDie(value) {
        if (!isEntry(value))
            fail("Iterator value " + value + " is not an entry object");
        return true;
    }
    
    function fail(m) {
        throw new TypeError(m);
    }
    
    function guardType(isType, object, typeName) {
        if (!isType(object))
            fail(toStringTag(object) + ' is not an instance of ' + typeName + '.');
    }

    function guardMethod(isType, obj, meth) {
        if (!isType(obj))
            fail(meth + ' method called on incompatible ' + toStringTag(object));
    }
    
    function guardMethodNull(obj, meth) {
        if (obj == null)
            fail(meth + ' called on null or undefined');
    }

    function toEntry(val, key) {
        return [key, val];
    }

    function toKey(value, key) {
        return key;
    }

    function toValue(value) {
        return value;
    }

    function entriesOf(iterable) {
        var entries = Array(toLen(iterable.size));
        iterable.forEach(function (value, key) {
            entries.push([key, value]);
        });
        return entries;
    }

    function keysOf(iterable) {
        var keys = Array(toLen(iterable.size));
        iterable.forEach(function (value, key) {
            keys.push([key]);
        });
        return keys;
    }

    function valuesOf(iterable) {
        var values = Array(toLen(iterable.size));
        iterable.forEach(function (value, key) {
            values.push([key]);
        });
        return values;
    }
    
    function iterNext(value) {
        return {
            value: value,
            done: false
        }
    }
    
    function iterDone() {
        return {
            value: void 0,
            done: true
        }
    }
    
    // FEATURE DETECTION
    function testMapConstructor(Map) {
        var map = new Map([['key', 'value']]);
        return map.size === 1;
    }
    
    function testIsIterable(Collection) {
        return typeof Collection.prototype.entries == 'function'
            && typeof Collection.prototype.values == 'function'
            && typeof Collection.prototype.keys == 'function';
    }

    function testSetConstructor(Set) {
        try {
            var set = Set(['value']);
            if (set.size !== 1)
                return false;
        }
        catch (e) {
            return false;
        }
    }

    var feat = {
        Map: {},
        Set: {},
        Array: {}
    }
    feat.Map.basic = typeof window.Map === 'function';
    feat.Map.constructorArg = !!NativeMap && testMapConstructorArg(NativeMap);
    feat.Map.iterators = feat.Map.basic && !!(window.Map.prototype.entries && window.Map.prototype.values && window.Map.prototype.keys);

    def(Object, {
        is: function is(a, b) {
            return a === 0 && b === 0
                ? 1 / v1 === 1 / v2
                : a === b || a !== a && b !== b;
        }
    });
    var is = Object.is;

    if (!Array.from) {
        defineProperty(
        Array,
        'from', {
            value: function from(source, mapFn, thisArg) {
                    if (source == null)
                        fail("Array.from requires an array-like object - not null or undefined");

                    if (isDef(mapFn) && !isFn(mapFn))
                        fail('Array.from: when provided, the second argument must be a function');

                    var len = toLen(source.length || source.size);
                    var result = isFn(this) ? new this(len) : new Array(len);
                    var hasThisArg = arguments.length > 2;
                    
                    var iterator = 
                        isMap(source) ? source.entires() :
                        isSet(source) ? source.values() :
                        isIterator(source) ? source :
                        void 0;
                    var i = 0;
                    if (iterator) {
                        var itRes = iterator.next();
                        while(!itRes.done) {
                            result[i] = mapFn ? (hasThisArg ? mapFn.call(thisArg, itRes.value, i) : mapFn(itRes.value, i)) : itRes.value;
                            itRes = iterator.next();
                            i++;
                        }
                    } else {
                        while (i < len) {
                            result[i] = mapFn ? (hasThisArg ? mapFn.call(thisArg, source[i], i) : mapFn(source[i], i)) : source[i];
                            i++;
                        }
                    }
                    return result;
                }
            }
        );
    }

    if (!Array.of) {
        def(Array, 'of', function of() {
                return Array.prototype.slice.call(arguments);
            });
    }

    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin#Polyfill
        if (!Array.prototype.copyWithin) {
            defineProperty(
            Array.prototype,
            'copyWithin', {
                'value': function copyWithin(target, start/*, end*/) {
                    // Steps 1-2.
                    if (this == null) {
                        throw new TypeError('this is null or not defined');
                    }

                    var O = Object(this);

                    // Steps 3-5.
                    var len = O.length >>> 0;

                    // Steps 6-8.
                    var relativeTarget = target >> 0;

                    var to = relativeTarget < 0 ?
                      Math.max(len + relativeTarget, 0) :
                      Math.min(relativeTarget, len);

                    // Steps 9-11.
                    var relativeStart = start >> 0;

                    var from = relativeStart < 0 ?
                      Math.max(len + relativeStart, 0) :
                      Math.min(relativeStart, len);

                    // Steps 12-14.
                    var end = arguments[2];
                    var relativeEnd = end === undefined ? len : end >> 0;

                    var final = relativeEnd < 0 ?
                      Math.max(len + relativeEnd, 0) :
                      Math.min(relativeEnd, len);

                    // Step 15.
                    var count = Math.min(final - from, len - to);

                    // Steps 16-17.
                    var direction = 1;

                    if (from < to && to < (from + count)) {
                        direction = -1;
                        from += count - 1;
                        to += count - 1;
                    }

                    // Step 18.
                    while (count > 0) {
                        if (from in O) {
                            O[to] = O[from];
                        } else {
                            delete O[to];
                        }

                        from += direction;
                        to += direction;
                        count--;
                    }

                    // Step 19.
                    return O;
                }
            });
        }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill#Polyfill
    if (!Array.prototype.fill) {
        defineProperty(
            Array.prototype,
            'fill', {
                'value': function fill(value) {

                    // Steps 1-2.
                    if (this == null) {
                        throw new TypeError('this is null or not defined');
                    }

                    var O = Object(this);

                    // Steps 3-5.
                    var len = O.length >>> 0;

                    // Steps 6-7.
                    var start = arguments[1];
                    var relativeStart = start >> 0;

                    // Step 8.
                    var k = relativeStart < 0 ?
                      Math.max(len + relativeStart, 0) :
                      Math.min(relativeStart, len);

                    // Steps 9-10.
                    var end = arguments[2];
                    var relativeEnd = end === undefined ?
                        len : end >> 0;

                    // Step 11.
                    var final = relativeEnd < 0 ?
                      Math.max(len + relativeEnd, 0) :
                      Math.min(relativeEnd, len);

                    // Step 12.
                    while (k < final) {
                        O[k] = value;
                        k++;
                    }

                    // Step 13.
                    return O;
                }
            });
    }

    def(Array.prototype, {
        find: function find(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        },
        findIndex: function findIndex(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        },
        includes: function includes(search, fromIndex) {
            for(var i = fromIndex >>> 0, n = this.length >>> 0; i < n; i++) {
                if (is(search, this[i]))
                    return true;
            }
            return false;
        }
    });

    if (!testIsIterable(window.Array)) {
            var ArrayIterator = function ArrayIterator(array, kind) {
                guardType(isArray, this, 'Map');
                defs(this, {
                    _array: array,
                    _index: 0,
                    _kind: kind
                });
            }
            def(ArrayIterator.prototype, 'next', function next() {
                guardMethod(isArrayIterator, this, 'ArrayIterator#next');
                    
                var array = this._array;
                
                if (!isArray(array))
                    return iterDone();
                
                var kind = this._kind,
                    i = this._index;
                
                if (i < array.length) {
                    ++this._index;
                    return iterNext(kind == 'key' ? i : kind == 'value' ? array[i] : [i, array[i]]);
                }
                
                this._array = void 0;
                return iterDone();
            });

            defs(window.Array.prototype, {
                entries: function entries() {
                    guardMethod(isArray, this, 'Array.prototype.entries');
                    return new ArrayIterator(this, 'key+value');

                },
                keys: function keys() {
                    guardMethod(isArray, this, 'Array.prototype.keys');
                    return new ArrayIterator(this, 'key');

                },
                values: function values() {
                    guardMethod(isArray, this, 'Array.prototype.values');
                    return new ArrayIterator(this, 'value');
                }
            });

    }
    
    if (!NativeMap) {
        window.Map = function Map() {
            guardType(isMap, this, 'Map');
            def(this, '_entries', def([], '_size', 0));
        }
        defs(window.Map.prototype, {
            clear: function clear() {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    delete ents[i];
                }
                ents._size = 0;
            },
            'delete': function delete_(key) {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    if (ents[i] && is(key, ents[i][0])) {
                        delete ents[i];
                        --ents[i]._size;
                        return true;
                    }
                }
                return false;
            },
            forEach: function forEach(callback, thisArg) {
                var ents = this._entries;
                for (var i = 0; i < ents.length; i++) {
                    if (mapData[i]) {
                        if (arguments.length >= 2)
                            callback.call(thisArg, ents[i][1], ents[i][0], this);
                        else
                            callback(ents[i][1], ents[i][0], this);
                    }
                }
            },
            get: function get(key) {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    if (ents[i] && is(key, ents[i][0])) {
                        return ents[i][1];
                    }
                }
            },
            has: function has(key) {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    if (ents[i] && is(key, ents[i][0])) {
                        return true;
                    }
                }
                return false;
            },
            set: function set(key, value) {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    if (ents[i] && is(key, ents[i][0])) {
                        ents[i][1] = value;
                        return this;
                    }
                }
                ents.push([key, value]);
                ++ents.size;
                return this;
            }
        });
        defineProperty(window.Map.prototype, 'size', {
            get: function size() {
                return this._entries.size;
            }
        });
    } else {
        if (!testMapConstructor(NativeMap)) {
            window.Map = function Map(source) {
                if (isCollection(source)) {
                    source.forEach(function (entry) {
                        isEntryOrDie(entry);
                        self.set(entry[0], entry[1]);
                    });
                }
                else if (isPlain(source) || isArrayLike(source)) {
                    for (var i = 0, n = source.length; i < n; i++) {
                        isEntryOrDie(source[i]);
                        self.set(source[i][0], source[i][1]);
                    }
                }
                else if (isIterator(source)) {
                    var item
                    while ((item = source.next()) && !item.done) {
                        isEntryOrDie(item.value);
                        self.set(item.value[0], item.value[1]);
                    }
                }
                else if (!isNull(source)) {
                    throw new TypeError(toString(source) + ' is not iterable');
                }
                return self;
            };
        }
    }
    
    if (!testIsIterable(window.Map)) {
        var MapIterator = function MapIterator(map, kind) {
            guardType(isMap, map, 'Map');
            defs(this, {
                _map: map,
                _index: 0,
                _kind: kind
            });
        }
        def(MapIterator.prototype, 'next', function next() {
            guardType(isMap, this, 'Map Iterator');
                
            var map = this._map,
                kind = this._kind;
            
            if (!map)
                return iterDone();
            
            var entries = map._entries;
            
            for (var i = this._index ; i < entries.length; i++) {
                if (entries[i]) {
                    var entry = entries[i];
                    this._index = i + 1;
                    return iterNext(kind == 'key' ? entry[0] : kind == 'value' ? entry[1] : entry)
                }
            }
            
            this._map = void 0;
            return iterDone();
        });
        
        if (NativeMap) {
            defineProperty(window.Map, '[[Data]]', {
                get: function() {
                    guardType(isMap, this, 'Map');
                    if (!this.hasOwnProperty('[[Data]]')) {
                        var mapData = def([], 'indexed', new NativeMap());
                        def(this, '[[Data]]', mapData);
                        return mapData;
                    }
                }
            }
            );
        }
        defs(window.Map, {
            entries: function entries() {
                guardMethod(isMap, this, 'Map.prototype.entries');
                return new MapIterator(this, 'key+value');
            },
            keys: function keys() {
                guardMethod(isMap, this, 'Map.prototype.keys');
                return new MapIterator(this, 'key');
            },
            values: function values() {
                guardMethod(isMap, this, 'Map.prototype.values');
                return new MapIterator(this, 'value');
            }
        });
    }
    
    if (!NativeSet) {
        window.Set = function Set() {
            guardType(isSet, this, 'Set');
            def(this, '_values', def([], '_size', 0));
        }
        defs(window.Set.prototype, {
            add: function add(val) {
                var vals = this._values;
                for (var i = 0, n = vals.length; i < n; i++) {
                    if (i in vals && is(val, vals[i])) {
                        vals[i] = val;
                        return this;
                    }
                }
                vals.push(val);
                ++vals._size;
                return this;
            },
            clear: function clear() {
                var vals = this._values;
                for (var i = 0, n = vals.length; i < n; i++) {
                    delete vals[i];
                }
                vals._size = 0;
            },
            'delete': function delete_(val) {
                var vals = this._values;
                for (var i = 0, n = vals.length; i < n; i++) {
                    if (i in vals && is(val, vals[i])) {
                        delete vals[i];
                        --vals._size;
                        return true;
                    }
                }
                return false;
            },
            forEach: function forEach(callback, thisArg) {
                var vals = this._values;
                for (var i = 0; i < vals.length; i++) {
                    if (i in vals) {
                        if (arguments.length >= 2)
                            callback.call(thisArg, vals[i], vals[i], this);
                        else
                            callback(vals[i], vals[i], this);
                    }
                }
            },
            has: function has(val) {
                return this._values.includes(key);
            }
        });
        defineProperty(window.Map.prototype, 'size', {
            get: function size() {
                return this._values.size;
            }
        });
    }
    
    if (!testIsIterable(window.Set)) {
        var SetIterator = function SetIterator(set, kind) {
            guardType(isSet, set, 'Set');
            defs(this, {
                _set: set,
                _index: 0,
                _kind: kind
            });
        }
        def(SetIterator.prototype, 'next', function next() {
            guardType(isSetIterator, this, 'Set Iterator');
            
            if (!this._set)
                return iterDone();
                
            var vals = this._set._values,
                kind = this._kind;
            
            for (var i = this._index, n = vals.length; i < n; i++) {
                if (i in vals) {
                    var val = vals[i];
                    this._index = i + 1;
                    return iterNext(kind == 'key+value' ? [val, val] : val);
                }
            }
            
            this._map = void 0;
            return iterDone();
        });
        
        if (NativeSet) {
            defineProperty(window.Map, '_entries', {
                get: function() {
                    guardType(isMap, this, 'Map');
                    if (!this.hasOwnProperty('_values')) {
                        var vals = def([], 'indexed', new NativeMap());
                        def(this, '_values', vals);
                        return vals;
                    }
                }
            });
        }
        defs(window.Set, {
            entries: function entries() {
                guardMethod(isSet, this, 'Set', 'entries');
                return new SetIterator(this, 'key+value');
            },
            keys: function keys() {
                guardMethod(isSet, this, 'Set', 'keys');
                return new SetIterator(this, 'key');
            },
            values: function values() {
                guardMethod(isSet, this, 'Set', 'values');
                return new SetIterator(this, 'value');
            }
        });
    }
    
})();