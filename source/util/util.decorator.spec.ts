/* eslint-disable unicorn/no-useless-undefined */
import { TransformFnParams } from 'class-transformer';

import { TransformStringArray, TransformStringBoolean } from './util.decorator';

describe('TransformStringBoolean', () => {
  it('should transform string boolean to boolean', () => {
    const subject1 = { value: 'true' } as TransformFnParams;
    const subject2 = { value: 'false' } as TransformFnParams;
    const subject3 = { value: 'True' } as TransformFnParams;
    const subject4 = { value: 'xxx' } as TransformFnParams;
    const subject5 = { value: undefined } as TransformFnParams;

    expect(TransformStringBoolean(subject1)).toStrictEqual(true);
    expect(TransformStringBoolean(subject2)).toStrictEqual(false);
    expect(TransformStringBoolean(subject3)).toStrictEqual(undefined);
    expect(TransformStringBoolean(subject4)).toStrictEqual(undefined);
    expect(TransformStringBoolean(subject5)).toStrictEqual(undefined);
  });
});

describe('TransformStringArray', () => {
  it('should transform separated strings or arrays into an array of unique strings', () => {
    const subject1 = { value: 'a' } as TransformFnParams;
    const subject2 = { value: [ 'a', 'b' ] } as TransformFnParams;
    const subject3 = { value: 'a,b|c' } as TransformFnParams;
    const subject4 = { value: [ 'a;b', 'b' ] } as TransformFnParams;
    const subject5 = { value: [ 'a,b', 'c' ] } as TransformFnParams;

    expect(TransformStringArray(subject1)).toStrictEqual([ 'a' ]);
    expect(TransformStringArray(subject2)).toStrictEqual([ 'a', 'b' ]);
    expect(TransformStringArray(subject3)).toStrictEqual([ 'a', 'b', 'c' ]);
    expect(TransformStringArray(subject4)).toStrictEqual([ 'a', 'b' ]);
    expect(TransformStringArray(subject5)).toStrictEqual([ 'a', 'b', 'c' ]);
  });
});
