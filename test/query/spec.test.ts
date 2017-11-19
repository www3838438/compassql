
import {Mark, AREA} from 'vega-lite/build/src/mark';
import {Type} from 'vega-lite/build/src/type';

import {assert} from 'chai';

import {fromSpec, hasWildcard} from '../../src/query/spec';
import {StackOffset} from 'vega-lite/build/src/stack';

describe('query/spec', () => {
  // describe('stack', () => {
  //   const STACKABLE_MARKS = [BAR, AREA];
  //   const NON_STACKABLE_MARKS = without(PRIMITIVE_MARKS, STACKABLE_MARKS);

  //   it('should always return null for nonstackable marks with at least of of the stack channel', () => {
  //     [undefined, 'center', 'none', 'zero', 'normalize'].forEach((_stack: StackOffset) => {
  //       NON_STACKABLE_MARKS.forEach((nonStackableMark) => {
  //         const specQ: SpecQuery = {
  //           mark: nonStackableMark,
  //           encodings: [
  //             {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.Y, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ],
  //           config: {stack: _stack}
  //         };
  //         assert.equal(stack(specQ), null);
  //       });
  //     });
  //   });

  //   it('should always return null for raw plot', () => {
  //     [undefined, 'center', 'none', 'zero', 'normalize'].forEach((_stack: StackOffset) => {
  //       PRIMITIVE_MARKS.forEach((mark) => {
  //         const specQ: SpecQuery = {
  //           mark: mark,
  //           encodings: [
  //             {channel: Channel.X, field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.Y, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ],
  //           config: {stack: _stack}
  //         };
  //         assert.equal(stack(specQ), null);
  //       });
  //     });
  //   });

  //   it('should always return null if there is no grouping channel', () => {
  //     [undefined, 'center', 'none', 'zero', 'normalize'].forEach((_stack: StackOffset) => {
  //       PRIMITIVE_MARKS.forEach((mark) => {
  //         const specQ: SpecQuery = {
  //           mark: mark,
  //           encodings: [
  //             {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.Y, field: 'N', type: Type.NOMINAL}
  //           ],
  //           config: {stack: _stack}
  //         };
  //         assert.equal(stack(specQ), null);
  //       });
  //     });
  //   });
  //   it('should always be disabled if both x and y are aggregate', () => {
  //     PRIMITIVE_MARKS.forEach((mark) => {
  //       const specQ: SpecQuery = {
  //         mark: mark,
  //         encodings: [
  //           {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //           {channel: Channel.Y, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //           {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //         ]
  //       };
  //       assert.isNull(stack(specQ));
  //     });
  //   });

  //   it('should always be disabled if neither x nor y is aggregate', () => {
  //     PRIMITIVE_MARKS.forEach((mark) => {
  //       const specQ: SpecQuery = {
  //           mark: mark,
  //           encodings: [
  //             {channel: Channel.X, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.Y, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ]
  //         };
  //       assert.isNull(stack(specQ));
  //     });
  //   });

  //   describe('stack().groupbyChannel, .fieldChannel', () => {
  //     it('should be correct for horizontal', () => {
  //       [BAR, AREA].forEach((stackableMark) => {
  //         const specQ: SpecQuery = {
  //           mark: stackableMark,
  //           encodings: [
  //             {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.Y, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ]
  //         };
  //         const _stack = stack(specQ);
  //         assert.equal(_stack.fieldChannel, Channel.X);
  //         assert.equal(_stack.groupbyChannel, Channel.Y);
  //       });
  //     });

  //     it('should be correct for horizontal (single)', () => {
  //       [BAR, AREA].forEach((stackableMark) => {
  //         const specQ: SpecQuery = {
  //           mark: stackableMark,
  //           encodings: [
  //             {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ]
  //         };
  //         const _stack = stack(specQ);
  //         assert.equal(_stack.fieldChannel, Channel.X);
  //         assert.equal(_stack.groupbyChannel, null);
  //       });
  //     });

  //     it('should be correct for vertical', () => {
  //       [BAR, AREA].forEach((stackableMark) => {
  //         const specQ: SpecQuery = {
  //           mark: stackableMark,
  //           encodings: [
  //             {channel: Channel.Y, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.X, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ]
  //         };
  //         const _stack = stack(specQ);
  //         assert.equal(_stack.fieldChannel, Channel.Y);
  //         assert.equal(_stack.groupbyChannel, Channel.X);
  //       });
  //     });

  //     it('should be correct for vertical (single)', () => {
  //       [BAR, AREA].forEach((stackableMark) => {
  //         const specQ: SpecQuery = {
  //           mark: stackableMark,
  //           encodings: [
  //             {channel: Channel.Y, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ]
  //         };
  //         const _stack = stack(specQ);
  //         assert.equal(_stack.fieldChannel, Channel.Y);
  //         assert.equal(_stack.groupbyChannel, null);
  //       });
  //     });


  //     it('should be correct for auto count', () => {
  //       [BAR, AREA].forEach((stackableMark) => {
  //         const specQ = {
  //             mark: stackableMark,
  //             encodings: [
  //               {channel: Channel.Y, autoCount: true, type: Type.QUANTITATIVE},
  //               {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //             ]
  //           };
  //         const _stack = stack(specQ);
  //         assert.isNotNull(_stack);
  //       });
  //     });
  //   });

  //   describe('stack().offset', () => {
  //     it('should return zero for stackable marks with at least of of the stack channel if stacked is unspecified', () => {
  //       [BAR, AREA].forEach((stackableMark) => {
  //         const specQ: SpecQuery = {
  //           mark: stackableMark,
  //           encodings: [
  //             {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //             {channel: Channel.Y, field: 'N', type: Type.NOMINAL},
  //             {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //           ]
  //         };
  //         assert.equal(stack(specQ).offset, 'zero');
  //       });
  //     });

  //     it('should return the specified stack for stackable marks with at least one of the stack channel', () => {
  //       ['center', 'zero', 'normalize'].forEach((_stack: StackOffset) => {
  //         [BAR, AREA].forEach((stackableMark) => {
  //           const specQ: SpecQuery = {
  //             mark: stackableMark,
  //             encodings: [
  //               {channel: Channel.X, aggregate: 'sum', field: 'Q', type: Type.QUANTITATIVE},
  //               {channel: Channel.Y, field: 'N', type: Type.NOMINAL},
  //               {channel: Channel.COLOR, field: 'N1', type: Type.NOMINAL},
  //             ],
  //             config: {stack: _stack}
  //           };
  //           assert.equal(stack(specQ).offset, _stack);
  //         });
  //       });
  //     });
  //   });
  // });

  describe('fromSpec', () => {
    it('should produce correct SpecQuery', () => {
      const specQ = fromSpec({
        data: {values: [{x: 1}, {x: 2}]},
        transform: [{filter: 'datum.x ===2'}],
        mark: Mark.POINT,
        encoding: {
          x: {
            field: 'x',
            type: Type.QUANTITATIVE,
            axis: {orient: 'top', shortTimeLabels: true, tickCount: 5, title: 'test x channel'},
          },
          y: {
            field: 'x', type: Type.QUANTITATIVE, scale: null
          },
          color: {
            field: 'n',
            type: 'nominal',
            legend: {orient: 'right', labelAlign: 'left', symbolSize: 12, title: 'test title'}
          }
        },
        config: {}
      });
      assert.deepEqual(specQ, {
        data: {values: [{x: 1}, {x: 2}]},
        transform: [{filter: 'datum.x ===2'}],
        mark: Mark.POINT,
        encodings: [
          {channel: 'x', field: 'x', type: Type.QUANTITATIVE, axis: {orient: 'top', shortTimeLabels: true, tickCount: 5, title: 'test x channel'}},
          {channel: 'y', field: 'x', type: Type.QUANTITATIVE, scale: false},
          {channel: 'color', field: 'n', type: 'nominal', legend: {orient: 'right', labelAlign: 'left', symbolSize: 12, title: 'test title'}}
        ],
        config: {}
      });
    });

    it('should produce correct SpecQuery with Sort', () => {
      const specQ = fromSpec({
        data: {values: [{x: 1}, {x: 2}]},
        transform: [{filter: 'datum.x ===2'}],
        mark: Mark.POINT,
        encoding: {
          x: {field: 'x', sort: 'ascending', type: Type.QUANTITATIVE},
          y: {field: 'x', sort: {field: 'x', op: 'mean', order: 'ascending'}, type: Type.QUANTITATIVE, scale: null}
        },
        config: {}
      });
      assert.deepEqual(specQ, {
        data: {values: [{x: 1}, {x: 2}]},
        transform: [{filter: 'datum.x ===2'}],
        mark: Mark.POINT,
        encodings: [
          {channel: 'x', field: 'x', sort: 'ascending', type: Type.QUANTITATIVE},
          {channel: 'y', field: 'x',  sort: {field: 'x', op: 'mean', order: 'ascending'}, type: Type.QUANTITATIVE, scale: false}
        ],
        config: {}
      });
    });

    it('should produce correct SpecQuery without data, transform, config', () => {
      const specQ = fromSpec({
        mark: Mark.POINT,
        encoding: {
          x: {field: 'x', type: Type.QUANTITATIVE},
          y: {field: 'x', type: Type.QUANTITATIVE, scale: null}
        },
      });
      assert.deepEqual(specQ, {
        mark: Mark.POINT,
        encodings: [
          {channel: 'x', field: 'x', type: Type.QUANTITATIVE},
          {channel: 'y', field: 'x', type: Type.QUANTITATIVE, scale: false}
        ]
      });
    });
  });

  describe('hasWildcard', () => {
    it('returns true if there is a wildcard mark', () => {
      assert(hasWildcard({
        mark: '?',
        encodings: []
      }));
    });

    it('returns true if there is a wildcard encoding top-level property', () => {
      assert(hasWildcard({
        mark: 'point',
        encodings: [{
          channel: '?',
          field: 'x',
          type: 'quantitative'
        }]
      }));
    });

    it('returns true if there is a wildcard encoding nested property', () => {
      assert(hasWildcard({
        mark: 'point',
        encodings: [{
          channel: 'x',
          scale: {
            type: '?',
          },
          field: 'x',
          type: 'quantitative'
        }]
      }));
    });

    it('returns false if there is no wildcard', () => {
      assert(!hasWildcard({
        mark: 'point',
        encodings: [{
          channel: 'x',
          bin: {
            maxbins: 20,
          },
          field: 'x',
          type: 'quantitative'
        }]
      }));
    });

    it('returns false if all wildcard are excluded', () => {
      assert(!hasWildcard({
        mark: '?',
        encodings: [{
          channel: 'x',
          bin: {
            maxbins: 20,
          },
          field: 'x',
          type: 'quantitative'
        }]
      }, {exclude: ['mark']}));
    });
  });
});
