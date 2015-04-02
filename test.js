// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of#Examples
QUnit.test("Array.of", function(assert) {
    assert.propEqual(Array.of(1), [1]);
    assert.propEqual(Array.of(1, 2, 3), [1, 2, 3]);
    assert.propEqual(Array.of(undefined), [undefined]);
});

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Examples
QUnit.test("Array.from", function(assert) {
    assert.propEqual(Array.from((function () { return Array.from(arguments) })(1, 2, 3)), [1, 2, 3]);
    assert.propEqual(Array.from("foo"), ["f", "o", "o"]);
    assert.propEqual(Array.from([1, 2, 3], function (x) { return x + x }), [2, 4, 6]);
    assert.propEqual(Array.from({ length: 5 }, function (v, k) { return k }), [0, 1, 2, 3, 4]);
});