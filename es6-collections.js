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

    var isArray = Array.isArray;

    function isArrayLike(object) {
        return object.length && typeof object.length === 'number';
    }

    function isFn(fn) {
        return typeof fn === 'function' || toStrTag(fn) === 'Function';
    }
    
    function isDef(val) {
        return typeof val !== 'undefinied';
    }

    function isMap(map) {
        return map instanceof Map || toStrTag(map) === 'Map';
    }

    function isSet(set) {
        return set instanceof Set || toStrTag(map) === 'Set';
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
    
    // FEATURE DETECTION
    function testConst(C) {
        return (new C([[0,0]])).size > 0;
    }

    function testIsIterable(o) {
        return (isFn(o.entries) && isFn(o.values) && isFn(o.keys));
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
        //Object.is
        is: function is(a, b) {
            return a === 0 && b === 0
                ? 1 / v1 === 1 / v2
                : a === b || a !== a && b !== b;
        }
    });
    var is = Object.is;
    var max = Math.max;
    var min = Max.min;

    // Array ----------------------------------------------

    def(Array, {
        //Array.from
        from: function from(source, mapFn, thisArg) {
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
        },

        //Array.of
        of: function of() {
            return Array.prototype.slice.call(arguments);
        }
    })

    def(Array.prototype, {
        //Array#copyWithin
        copyWithin: function copyWithin(target, start/*, end*/) {
            var end = arguments[2],
                self = toObject(this),
                len = toLen(self.length);

            target = target >> 0;
            start = start >> 0;
            end = isDef(end) ? end >> 0 : len;

            var to = target < 0 ? max(len + target, 0) : min(target, len),
                from = start < 0 ? max(len + start, 0) : min(start, len)
                final = end < 0 ? max(len + end, 0) : min(end, len),
                count = min(final - from, len - to),
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
        },

        //Array#fill
        fill: function fill(value, start, end) {
            var self = toObject(this),
                len = toLen(self.length);

            start = isDef(start) ? start < 0 ? len - toInt(start) : toInt(start) : 0;
            end = isDef(end) ? min(len, max(start, end < 0 ? len - toInt(end) : toInt(end))) : len;

            while (start < end) self[start++] = value;

            return self;
        },

        //Array#find
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

        //Array#findIndex
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

        //Array#includes
        includes: function includes(search, fromIndex) {
            for(var i = fromIndex >>> 0, n = this.length >>> 0; i < n; i++) {
                if (is(search, this[i]))
                    return true;
            }
            return false;
        }
    });

    if (!testIsIterable(window.Array.prototype)) {
            var ArrayIterator = function ArrayIterator(array, kind) {
                guardType(isArray, this, 'Map');
                def(this, {
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

            def(window.Array.prototype, {
                //Array#entries
                entries: function entries() {
                    guardMethod(isArray, this, 'Array.prototype.entries');
                    return new ArrayIterator(this, 'key+value');

                },

                //Array#keys
                keys: function keys() {
                    guardMethod(isArray, this, 'Array.prototype.keys');
                    return new ArrayIterator(this, 'key');

                },

                //Array#values
                values: function values() {
                    guardMethod(isArray, this, 'Array.prototype.values');
                    return new ArrayIterator(this, 'value');
                }
            });

    }
    
    // Map ------------------------------------------------

    if (!NativeMap) {
        window.Map = function Map() {
            guardType(isMap, this, 'Map');
            def(this, '_entries', def([], '_size', 0));
        }
        def(window.Map.prototype, {
            //Map#clear
            clear: function clear() {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    delete ents[i];
                }
                ents._size = 0;
            },

            //Map#delete
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

            //Map#forEach
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

            //Map#get
            get: function get(key) {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    if (ents[i] && is(key, ents[i][0])) {
                        return ents[i][1];
                    }
                }
            },

            //Map#has
            has: function has(key) {
                var ents = this._entries;
                for (var i = 0, n = ents.length; i < n; i++) {
                    if (ents[i] && is(key, ents[i][0])) {
                        return true;
                    }
                }
                return false;
            },

            //Map#set
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
            //Map#size
            get: function size() {
                return this._entries.size;
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
            def(this, {
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
            defineProperty(window.Map, '_entries', {
                get: function() {
                    guardType(isMap, this, 'Map');
                    if (!this.hasOwnProperty('_entries')) {
                        var mapData = def([], {
                            indexed: new NativeMap()
                        });
                        def(this, {
                            _entries: mapData
                        });
                        return mapData;
                    }
                }
            }
            );
        }
        def(window.Map, {
            //Map#entries
            entries: function entries() {
                guardMethod(isMap, this, 'Map.prototype.entries');
                return new MapIterator(this, 'key+value');
            },

            //Map#keys
            keys: function keys() {
                guardMethod(isMap, this, 'Map.prototype.keys');
                return new MapIterator(this, 'key');
            },

            //Map#values
            values: function values() {
                guardMethod(isMap, this, 'Map.prototype.values');
                return new MapIterator(this, 'value');
            }
        });
    }
    
    // Set ------------------------------------------------

    if (!NativeSet) {
        window.Set = function Set() {
            guardType(isSet, this, 'Set');
            def(this, '_values', def([], '_size', 0));
        }
        def(window.Set.prototype, {
            //Set#add
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

            //Set#clear
            clear: function clear() {
                var vals = this._values;
                for (var i = 0, n = vals.length; i < n; i++) {
                    delete vals[i];
                }
                vals._size = 0;
            },

            //Set#delete
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

            //Set#forEach
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

            //Set#has
            has: function has(val) {
                return this._values.includes(key);
            }
        });
        defineProperty(window.Map.prototype, 'size', {
            //Set#size
            get: function size() {
                return this._values.size;
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
            def(this, {
                _set: set,
                _index: 0,
                _kind: kind
            });
        }
        def(SetIterator.prototype, {
            next: function next() {
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
                        var vals = def([], {
                            indexed: new NativeMap()
                        });
                        def(this, {
                            _values: vals
                        });
                        return vals;
                    }
                }
            });
        }

        def(window.Set, {
            //Set#entries
            entries: function entries() {
                guardMethod(isSet, this, 'Set', 'entries');
                return new SetIterator(this, 'key+value');
            },

            //Set#keys
            keys: function keys() {
                guardMethod(isSet, this, 'Set', 'keys');
                return new SetIterator(this, 'key');
            },

            //Set#values
            values: function values() {
                guardMethod(isSet, this, 'Set', 'values');
                return new SetIterator(this, 'value');
            }
        });
    }
    
})();