// Reused utility functions:
function isPrime(element, index, array) {
    var start = 2;
    while (start <= Math.sqrt(element)) {
        if (element % start++ < 1) {
            return false;
        }
    }
    return element > 1;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of#Examples
QUnit.test("Array.of", function(assert) {
    assert.propEqual(
        Array.of(1),
        [1]
    );
    assert.propEqual(
        Array.of(1, 2, 3),
        [1, 2, 3]
    );
    assert.propEqual(
        Array.of(undefined),
        [undefined]
    );
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Examples
QUnit.test("Array.from", function(assert) {
    assert.propEqual(
        Array.from((function () { return Array.from(arguments) })(1, 2, 3)),
        [1, 2, 3]
    );
    assert.propEqual(
        Array.from("foo"), ["f", "o", "o"]
    );
    assert.propEqual(
        Array.from([1, 2, 3], function (x) { return x + x }),
        [2, 4, 6]
    );
    assert.propEqual(
        Array.from({ length: 5 }, function (v, k) { return k }),
        [0, 1, 2, 3, 4]
    );
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin#Examples
QUnit.test("Array.prototype.copyWithin", function(assert) {
    assert.propEqual(
        [1, 2, 3, 4, 5].copyWithin(0, 3),
        [4, 5, 3, 4, 5]
    );
    assert.propEqual(
        [1, 2, 3, 4, 5].copyWithin(0, 3, 4),
        [4, 2, 3, 4, 5]
    );
    assert.propEqual(
        [1, 2, 3, 4, 5].copyWithin(0, -2, -1),
        [4, 2, 3, 4, 5]
    );
    assert.propEqual(
        [].copyWithin.call({length: 5, 3: 1}, 0, 3),
        {0: 1, 3: 1, length: 5}
    );
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill#Examples
QUnit.test("Array.prototype.fill", function(assert) {
    assert.propEqual(
        [1, 2, 3].fill(4),
        [4, 4, 4]
    );
    assert.propEqual(
        [1, 2, 3].fill(4, 1),
        [1, 4, 4]
    );
    assert.propEqual(
        [1, 2, 3].fill(4, 1, 2),
        [1, 4, 3]
    );
    assert.propEqual(
        [1, 2, 3].fill(4, 1, 1),
        [1, 2, 3]
    );
    assert.propEqual(
        [1, 2, 3].fill(4, -3, -2),
        [4, 2, 3]
    );
    assert.propEqual(
        [1, 2, 3].fill(4, NaN, NaN),
        [1, 2, 3]
    );
    assert.propEqual(
        [].fill.call({ length: 3 }, 4),
        {0: 4, 1: 4, 2: 4, length: 3}
    );
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Examples
QUnit.test("Array.prototype.find", function(assert) {
    assert.propEqual(
        [4, 6, 8, 12].find(isPrime),
        undefined
    );
    assert.propEqual(
        [4, 5, 8, 12].find(isPrime),
        5
    );
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex#Examples
QUnit.test("Array.prototype.findIndex", function(assert) {
    assert.propEqual(
        [4, 6, 8, 12].find(isPrime),
        -1
    );
    assert.propEqual(
        [4, 5, 8, 12].find(isPrime),
        2
    );
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes#Examples
QUnit.test("Array.prototype.includes", function(assert) {
    assert.propEqual(
        [1, 2, 3].includes(2),
        true
    );
    assert.propEqual(
        [1, 2, 3].includes(4),
        false
    );
    assert.propEqual(
        [1, 2, 3].includes(3, 3),
        false
    );
    assert.propEqual(
        [1, 2, 3].includes(3, -1),
        true
    );
    assert.propEqual(
        [1, 2, NaN].includes(NaN),
        true
    );
});