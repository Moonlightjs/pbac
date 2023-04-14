import conditions from '../src/conditions';

describe('conditions', () => {
  describe('NumericEquals', () => {
    it('should return true if a equals b', () => {
      expect(conditions.NumericEquals(1, 1)).toBe(true);
    });

    it('should return false if a does not equal b', () => {
      expect(conditions.NumericEquals(1, 2)).toBe(false);
    });

    it('should return false if a is not a number', () => {
      expect(conditions.NumericEquals('1', 1)).toBe(false);
    });

    it('should return false if b is not a number', () => {
      expect(conditions.NumericEquals(1, '1')).toBe(false);
    });
  });

  describe('NumericNotEquals', () => {
    it('should return true if a does not equal b', () => {
      expect(conditions.NumericNotEquals(1, 2)).toBe(true);
    });

    it('should return false if a equals b', () => {
      expect(conditions.NumericNotEquals(1, 1)).toBe(false);
    });

    it('should return false if a is not a number', () => {
      expect(conditions.NumericNotEquals('1', 1)).toBe(false);
    });

    it('should return false if b is not a number', () => {
      expect(conditions.NumericNotEquals(1, '1')).toBe(false);
    });
  });

  describe('NumericLessThan', () => {
    it('NumericLessThan returns true if a is less than b', () => {
      expect(conditions.NumericLessThan(1, 2)).toBe(true);
    });

    it('NumericLessThan returns false if a is equal to b', () => {
      expect(conditions.NumericLessThan(2, 2)).toBe(false);
    });

    it('NumericLessThan returns false if a is greater than b', () => {
      expect(conditions.NumericLessThan(3, 2)).toBe(false);
    });

    it('NumericLessThan returns false if a or b is not a number', () => {
      expect(conditions.NumericLessThan(1, '2')).toBe(false);
      expect(conditions.NumericLessThan('1', 2)).toBe(false);
      expect(conditions.NumericLessThan('1', '2')).toBe(false);
      expect(conditions.NumericLessThan(1, NaN)).toBe(false);
      expect(conditions.NumericLessThan(NaN, 2)).toBe(false);
      expect(conditions.NumericLessThan(NaN, NaN)).toBe(false);
    });

    it('NumericLessThan returns false if a or b is undefined or null', () => {
      expect(conditions.NumericLessThan(undefined, 2)).toBe(false);
      expect(conditions.NumericLessThan(1, undefined)).toBe(false);
      expect(conditions.NumericLessThan(undefined, undefined)).toBe(false);
      expect(conditions.NumericLessThan(null, 2)).toBe(false);
      expect(conditions.NumericLessThan(1, null)).toBe(false);
      expect(conditions.NumericLessThan(null, null)).toBe(false);
    });
  });

  describe('NumericGreaterThanEquals', () => {
    it('NumericGreaterThanEquals returns true if a is greater than or equal to b', () => {
      expect(conditions.NumericGreaterThanEquals(3, 2)).toBe(true);
      expect(conditions.NumericGreaterThanEquals(3, 3)).toBe(true);
      expect(conditions.NumericGreaterThanEquals(0, -1)).toBe(true);
    });

    it('NumericGreaterThanEquals returns false if a is less than b', () => {
      expect(conditions.NumericGreaterThanEquals(2, 3)).toBe(false);
      expect(conditions.NumericGreaterThanEquals(-1, 0)).toBe(false);
    });

    it('NumericGreaterThanEquals returns false if a or b is not a number', () => {
      expect(conditions.NumericGreaterThanEquals('foo', 2)).toBe(false);
      expect(conditions.NumericGreaterThanEquals(3, 'bar')).toBe(false);
      expect(conditions.NumericGreaterThanEquals('foo', 'bar')).toBe(false);
      expect(conditions.NumericGreaterThanEquals(3, NaN)).toBe(false);
      expect(conditions.NumericGreaterThanEquals(NaN, 3)).toBe(false);
      expect(conditions.NumericGreaterThanEquals(NaN, NaN)).toBe(false);
    });
  });

  describe('NumericGreaterThan', () => {
    test('NumericGreaterThan returns true if a > b', () => {
      expect(conditions.NumericGreaterThan(5, 2)).toBe(true);
    });

    test('NumericGreaterThan returns false if a <= b', () => {
      expect(conditions.NumericGreaterThan(2, 5)).toBe(false);
    });

    test('NumericGreaterThan returns false if a or b is not a number', () => {
      expect(conditions.NumericGreaterThan('a', 5)).toBe(false);
      expect(conditions.NumericGreaterThan(2, 'b')).toBe(false);
      expect(conditions.NumericGreaterThan('a', 'b')).toBe(false);
      expect(conditions.NumericGreaterThan(null, 2)).toBe(false);
      expect(conditions.NumericGreaterThan(2, undefined)).toBe(false);
    });
  });

  describe('NumericLessThanEquals', () => {
    test('NumericLessThanEquals returns true if a is less than or equal to b', () => {
      expect(conditions.NumericLessThanEquals(5, 10)).toBe(true);
      expect(conditions.NumericLessThanEquals(10, 10)).toBe(true);
      expect(conditions.NumericLessThanEquals(-5, -3)).toBe(true);
    });

    test('NumericLessThanEquals returns false if a is greater than b', () => {
      expect(conditions.NumericLessThanEquals(10, 5)).toBe(false);
      expect(conditions.NumericLessThanEquals(0, -10)).toBe(false);
    });

    test('NumericLessThanEquals returns false if a or b is not a number', () => {
      expect(conditions.NumericLessThanEquals('5', 10)).toBe(false);
      expect(conditions.NumericLessThanEquals(10, undefined)).toBe(false);
      expect(conditions.NumericLessThanEquals({}, [])).toBe(false);
    });
  });

  // Add more tests for other conditions here...
});
