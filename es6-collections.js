//https://people.mozilla.org/~jorendorff/es6-draft.html#sec-map-objects

(function () {
    var NativeMap = window.Map;
    var NativeSet = window.Set;

    var toString = Object.prototype.toString;
    var defineProperty = Object.defineProperty;
    var defineProperties = Object.defineProperties;
    
    function toStrTag(object) {
        return toString.call(object).slice(8, -1);
    }
    
    function toInt(val) {
        return val >> 0;
    }
    
    function toLen(val) {
        return val >= 0 ? val >> 0 : 0;
    }

    var isArray = Array.isArray;

    function isArrayLike(object) {
        return object.length && typeof object.length === 'number';
    }

    function isFn(fn) {
        return typeof fn === 'function' || toStrTag(fn) === 'Function';
    }
    
    function isDef(val) {
        return typeof val !== 'undefined';
    }

    function isMap(map) {
        return map instanceof Map || toStrTag(map) === 'Map';
    }

    function isSet(set) {
        return set instanceof Set || toStrTag(set) === 'Set';
    }

    function isStr(object) {
        return typeof object == 'string';
    }

    function isIterator(object) {
        return object && isFn(object.next);
    }

    function isIterable(o) {
        return isArray(o) || isStr(o) || isMap(o) || isSet(o) || isIterator(o);
    }

    function iterate(o, fn) {
        var it = isIterator(o) ? o : isMap(o) ? o.entries() : o.values(),
            res = it.next();
        while (!res.done) {
            fn(res.value);
            res = it.next();
        }
    }

    function isEntry(object) {
        var type = typeof object;
        return type != 'number' && type != 'string';
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
            fail(toStrTag(object) + ' is not an instance of ' + typeName + '.');
    }

    function guardMethod(isType, obj, meth) {
        if (!isType(obj))
            fail(meth + ' method called on incompatible ' + toStrTag(object));
    }

    function toObject(obj) {
        if(obj == null) fail('Value is undefinied or null.')
        return Object(obj);
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

    function mapAdd(ent) {
        this.set(ent[0], ent[1]);
    }

    function toPos(i, len) {
        i = i | 0;
        return  i < 0 ? max(0, len + i) : min(i, len);
    }
    
    // FEATURE DETECTION
    function testConst(C) {
        return (new C([[0,0]])).size > 0;
    }

    function testIsIterable(o) {
        return (isFn(o.entries) && isFn(o.values) && isFn(o.keys));
    }

    if (!Object.is)
        defineProperty(Object, 'is', {
            //Object.is
            value: function is(a, b) {
                return a === 0 && b === 0
                    ? 1 / v1 === 1 / v2
                    : a === b || a !== a && b !== b;
            }
        });

    var is = Object.is;
    var max = Math.max;
    var min = Math.min;

    // Array.from
    if (!Array.from)
        defineProperty(Array, 'from', {
            value: function from(source /*, mapFn, thisArg*/) {
                var mapFn = arguments[1],
                    thisArg = arguments[2];
                
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
        });

    // Array.of
    if (!Array.of)
        defineProperty(Array, 'of', {
            value: function of() {
                return Array.prototype.slice.call(arguments);
            }
        });

    // Array#copyWithin
    if (!Array.prototype.copyWithin)
        defineProperty(Array.prototype, 'copyWithin', {
            value: function copyWithin(target, start/*, end*/) {
                var self = toObject(this),
                    len = toLen(self.length),
                    end = arguments.length >= 3 ? toPos(arguments[2], len) : len,
                    to = toPos(target, len),
                    from = toPos(start, len),
                    count = min(end - from, len - to),
                    direction = 1;

                if (from < to && to < (from + count)) {
                    direction = -1;
                    from += count - 1;
                    to += count - 1;
                }

                while (count > 0) {
                    if (from in self)
                        self[to] = self[from];
                    else
                        delete self[to];

                    from += direction;
                    to += direction;
                    count--;
                }

                return self;
            }
        });

    // Array#fill
    if (!Array.prototype.fill)
        defineProperty(Array.prototype, 'fill', {
            value: function fill(value/*, start, end*/) {
                var start = arguments[1],
                    self = toObject(this),
                    len = toLen(self.length),
                    end = arguments.length >= 3 ? arguments[2] : len;

                start = toPos(start, len);
                end = toPos(end, len);

                while (start < end) self[start++] = value;

                return self;
            }
        });

    // Array#find
    if (!Array.prototype.find)
        defineProperty(Array.prototype, 'find', {
            value: function find(predicate/*, thisArg */) {
                if (!isFn(predicate))
                    fail('predicate must be a function');

                var thisArg = arguments[1],
                    hasThisArg = arguments.length >= 2,
                    self = toObject(this),
                    len = toLen(this.length),
                    value;

                for (var i = 0; i < len; i++) {
                    value = self[i];
                    if (hasThisArg ? predicate.call(thisArg, value, i, self) : predicate(value, i, self))
                        return value;
                }
                return void 0;
            }
        });

    //Array#findIndex
    if (!Array.prototype.findIndex)
        defineProperty(Array.prototype, 'findIndex', {
            value: function findIndex(predicate/*, thisArg */) {
                if (!isFun(predicate))
                    fail('predicate must be a function');

                var thisArg = arguments[1],
                    hasThisArg = arguments.length >= 2,
                    self = toObject(this),
                    len = toLen(this.length),
                    value;

                for (var i = 0; i < len; i++) {
                    value = self[i];
                    if (hasThisArg ? predicate.call(thisArg, value, i, self) : predicate(value, i, self))
                        return i;
                }
                return -1;
            }
        });

    // Array#includes
    if (!Array.prototype.includes)
        defineProperty(Array.prototype, 'includes', {
            value: function includes(search/*, fromIndex*/) {
                var self = toObject(this),
                    len = toLen(this.length),
                    i = toPos(arguments[1], len);
                while(i < len) {
                    if (is(search, this[i++]))
                        return true;
                }
                return false;
            }
        });

    if (!testIsIterable(window.Array.prototype)) {
            var ArrayIterator = function ArrayIterator(array, kind) {
                guardType(isArray, array, 'Array');
                defineProperties(this, {
                    _array: { value: array },
                    _index: { value: 0, writable: true },
                    _kind: { value: kind }
                });
            }
            var isArrayIterator = function(iterator) {
                return iterator instanceof ArrayIterator;
            }

            defineProperty(ArrayIterator.prototype, 'next', {
                value: function next() {
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
                }
            });

            defineProperties(window.Array.prototype, {
                //Array#entries
                entries: {
                    value: function entries() {
                        guardMethod(isArray, this, 'Array.prototype.entries');
                        return new ArrayIterator(this, 'key+value');
                    }
                },

                //Array#keys
                keys: {
                    value: function keys() {
                        guardMethod(isArray, this, 'Array.prototype.keys');
                        return new ArrayIterator(this, 'key');
                    }
                },

                //Array#values
                values: {
                    value: function values() {
                        guardMethod(isArray, this, 'Array.prototype.values');
                        return new ArrayIterator(this, 'value');
                    }
                }
            });

    }
    
    // Map ------------------------------------------------

    if (!NativeMap) {
        window.Map = function Map() {
            guardType(isMap, this, 'Map');
            defineProperties(this, {
                _entries: { value: [] },
                _size: { 
                    value: 0,
                    writable: true
                }
            });
        }
        defineProperties(window.Map.prototype, {
            //Map#clear
            clear: {
                value: function clear() {
                    var ents = this._entries;
                    for (var i = 0, n = ents.length; i < n; i++) {
                        delete ents[i];
                    }
                    this._size = 0;
                }
            },

            //Map#delete
            'delete': {
                value: function delete_(key) {
                    var ents = this._entries;
                    for (var i = 0, n = ents.length; i < n; i++) {
                        if (ents[i] && is(key, ents[i][0])) {
                            delete ents[i];
                            --this._size;
                            return true;
                        }
                    }
                    return false;
                }
            },

            //Map#forEach
            forEach: {
                value: function forEach(callback/*, thisArg*/) {
                    var thisArg = arguments[1],
                        hasThisArg = arguments.length >= 2;
                        ents = this._entries;
                    for (var i = 0; i < ents.length; i++) {
                        if (mapData[i]) {
                            if (hasThisArg)
                                callback.call(thisArg, ents[i][1], ents[i][0], this);
                            else
                                callback(ents[i][1], ents[i][0], this);
                        }
                    }
                }
            },

            //Map#get
            get: {
                value: function get(key) {
                    var ents = this._entries;
                    for (var i = 0, n = ents.length; i < n; i++) {
                        if (ents[i] && is(key, ents[i][0])) {
                            return ents[i][1];
                        }
                    }
                }
            },

            //Map#has
            has: {
                value: function has(key) {
                    var ents = this._entries;
                    for (var i = 0, n = ents.length; i < n; i++) {
                        if (ents[i] && is(key, ents[i][0])) {
                            return true;
                        }
                    }
                    return false;
                }
            },

            //Map#set
            set: {
                value: function set(key, value) {
                    var ents = this._entries;
                    for (var i = 0, n = ents.length; i < n; i++) {
                        if (ents[i] && is(key, ents[i][0])) {
                            ents[i][1] = value;
                            return this;
                        }
                    }
                    ents.push([key, value]);
                    ++this._size;
                    return this;
                }
            },

            //Map#size
            size: {
                get: function size() {
                    return this._size;
                }
            }
        });

    } else {
        if (!testConst(NativeMap)) {
            window.Map = function Map(source) {
                var self = new NativeMap();
                if (isIterable(source))
                    iterate(source, mapAdd.bind(self));
                else if (!isNull(source))
                    fail(toString(source) + ' is not iterable');
                return self;
            };
        }
    }
    
    if (!testIsIterable(window.Map.prototype)) {
        var MapIterator = function MapIterator(map, kind) {
            guardType(isMap, map, 'Map');
            defineProperties(this, {
                _map: { value: map },
                _index: { value: 0 },
                _kind: { value: kind }
            });
        }
        defineProperty(MapIterator.prototype, 'next', {
            value: function next() {
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
            }
        });
        
        if (NativeMap) {
            defineProperty(window.Map, '_entries', {
                get: function() {
                    guardType(isMap, this, 'Map');
                    if (!this.hasOwnProperty('_entries')) {
                        var mapData = defineProperty([], 'indexed', {
                            value: new NativeMap()
                        });
                        defineProperty(this, '_entries', {
                            value: mapData
                        });
                        return mapData;
                    }
                }
            }
            );
        }

        defineProperties(window.Map, {
            //Map#entries
            entries: {
                value: function entries() {
                    guardMethod(isMap, this, 'Map.prototype.entries');
                    return new MapIterator(this, 'key+value');
                }
            },

            //Map#keys
            keys: {
                value: function keys() {
                    guardMethod(isMap, this, 'Map.prototype.keys');
                    return new MapIterator(this, 'key');
                }
            },

            //Map#values
            values: {
                value: function values() {
                    guardMethod(isMap, this, 'Map.prototype.values');
                    return new MapIterator(this, 'value');
                }
            }
        });
    }
    
    // Set ------------------------------------------------

    if (!NativeSet) {
        window.Set = function Set() {
            guardType(isSet, this, 'Set');
            defineProperties(this, {
                _values: { value: [] },
                _size: { 
                    value: 0,
                    writable: true
                }
            });
        }
        defineProperties(window.Set.prototype, {
            //Set#add
            add: {
                value: function add(val) {
                    var vals = this._values;
                    for (var i = 0, n = vals.length; i < n; i++) {
                        if (i in vals && is(val, vals[i])) {
                            vals[i] = val;
                            return this;
                        }
                    }
                    vals.push(val);
                    ++this._size;
                    return this;
                }
            },

            //Set#clear
            clear: {
                value: function clear() {
                    var vals = this._values;
                    for (var i = 0, n = vals.length; i < n; i++) {
                        delete vals[i];
                    }
                    this._size = 0;
                }
            },

            //Set#delete
            'delete': {
                value: function delete_(val) {
                    var vals = this._values;
                    for (var i = 0, n = vals.length; i < n; i++) {
                        if (i in vals && is(val, vals[i])) {
                            delete vals[i];
                            --this._size;
                            return true;
                        }
                    }
                    return false;
                }
            },

            //Set#forEach
            forEach: {
                value: function forEach(callback/*, thisArg*/) {
                    var thisArg = arguments[1]
                        hasThisArg = arguments.length >= 2,
                        vals = this._values;
                    for (var i = 0; i < vals.length; i++) {
                        if (i in vals) {
                            if (hasThisArg)
                                callback.call(thisArg, vals[i], vals[i], this);
                            else
                                callback(vals[i], vals[i], this);
                        }
                    }
                }
            },

            //Set#has
            has: {
                value: function has(val) {
                    return this._values.includes(key);
                }
            },

            //Set#size
            size: {
                get: function size() {
                    return this._size;
                }
            }
        });

    } else {
        if (!testConst(NativeSet)) {
            window.Set = function Set(source) {
                var self = new NativeSet();
                if (isIterable(source))
                    iterate(source, self.add.bind(self));
                else if (!isNull(source))
                    fail(toString(source) + ' is not iterable');
                return self;
            };
        }
    }
    
    if (!testIsIterable(window.Set.prototype)) {
        var SetIterator = function SetIterator(set, kind) {
            guardType(isSet, set, 'Set');
            defineProperties(this, {
                _set: { value: set },
                _index: { value: 0 },
                _kind: { value: kind }
            });
        }

        defineProperty(SetIterator.prototype, 'next', {
            value: function next() {
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
            }
        });
        
        if (NativeSet) {
            defineProperty(window.Map.prototype, '_entries', {
                get: function() {
                    guardType(isMap, this, 'Map');
                    if (!this.hasOwnProperty('_values')) {
                        var vals = defineProperty([], 'indexed', {
                            value: new NativeMap()
                        });
                        defineProperty(this, '_values', {
                            value: vals
                        });
                        return vals;
                    }
                }
            });
        }

        defineProperties(window.Set, {
            //Set#entries
            entries: {
                value: function entries() {
                    guardMethod(isSet, this, 'Set', 'entries');
                    return new SetIterator(this, 'key+value');
                }
            },

            //Set#keys
            keys: {
                value: function keys() {
                    guardMethod(isSet, this, 'Set', 'keys');
                    return new SetIterator(this, 'key');
                }
            },

            //Set#values
            values: {
                value: function values() {
                    guardMethod(isSet, this, 'Set', 'values');
                    return new SetIterator(this, 'value');
                }
            }
        });
    }
    
})();