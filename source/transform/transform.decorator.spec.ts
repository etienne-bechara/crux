/* eslint-disable unicorn/no-useless-undefined */
import { plainToClass } from 'class-transformer';

import { ToBoolean, ToNumber, ToNumberArray, ToString, ToStringArray } from './transform.decorator';

class TransformDto {

  @ToBoolean() public toBoolean01: boolean;
  @ToBoolean() public toBoolean02: boolean;
  @ToBoolean() public toBoolean03: boolean;
  @ToBoolean() public toBoolean04: boolean;
  @ToBoolean() public toBoolean05: boolean;
  @ToBoolean() public toBoolean06: boolean;
  @ToBoolean() public toBoolean07: boolean;
  @ToBoolean() public toBoolean08: boolean;
  @ToBoolean() public toBoolean09: boolean;
  @ToNumber() public toNumber01: boolean;
  @ToNumber() public toNumber02: boolean;
  @ToNumber() public toNumber03: boolean;
  @ToNumber() public toNumber04: boolean;
  @ToNumber() public toNumber05: boolean;
  @ToNumber() public toNumber06: boolean;
  @ToNumber() public toNumber07: boolean;
  @ToNumber() public toNumber08: boolean;
  @ToNumber() public toNumber09: boolean;
  @ToString({ case: 'lower' }) public toString01: string;
  @ToString({ case: 'upper' }) public toString02: string;
  @ToString({ case: 'title' }) public toString03: string;
  @ToString() public toString04: string;
  @ToString() public toString05: string;
  @ToString() public toString06: string;
  @ToString() public toString07: string;
  @ToString() public toString08: string;
  @ToString() public toString09: string;
  @ToStringArray() public toStringArray01: string[];
  @ToStringArray() public toStringArray02: string[];
  @ToStringArray({ splitBy: [ ',', '|' ] }) public toStringArray03: string[];
  @ToStringArray({ splitBy: [ ';' ] }) public toStringArray04: string[];
  @ToStringArray() public toStringArray05: string[];
  @ToStringArray() public toStringArray06: string[];
  @ToStringArray() public toStringArray07: string[];
  @ToStringArray() public toStringArray08: string[];
  @ToStringArray() public toStringArray09: string[];
  @ToNumberArray() public toNumberArray01: string[];
  @ToNumberArray() public toNumberArray02: string[];
  @ToNumberArray({ splitBy: [ ',', '|' ] }) public toNumberArray03: string[];
  @ToNumberArray({ splitBy: [ ';' ] }) public toNumberArray04: string[];
  @ToNumberArray() public toNumberArray05: string[];
  @ToNumberArray() public toNumberArray06: string[];
  @ToNumberArray() public toNumberArray07: string[];
  @ToNumberArray() public toNumberArray08: string[];
  @ToNumberArray() public toNumberArray09: string[];

}

const transformSubject = {
  toBoolean01: 'true',
  toBoolean02: 'false',
  toBoolean03: 1,
  toBoolean04: 0,
  toBoolean05: true,
  toBoolean06: false,
  toBoolean07: 'True',
  toBoolean08: null,
  toBoolean09: undefined,
  toNumber01: '123',
  toNumber02: '123.456',
  toNumber03: 123,
  toNumber04: 123.456,
  toNumber05: true,
  toNumber06: false,
  toNumber07: 'xxx',
  toNumber08: null,
  toNumber09: undefined,
  toString01: 'LOWER CASE',
  toString02: 'upper case',
  toString03: 'tITLE cASE',
  toString04: '',
  toString05: 0,
  toString06: 1,
  toString07: true,
  toString08: null,
  toString09: undefined,
  toStringArray01: 'a',
  toStringArray02: [ 'a', 'b' ],
  toStringArray03: 'a,b|c',
  toStringArray04: [ 'a;b', 'b' ],
  toStringArray05: [ 'a,b', 'c' ],
  toStringArray06: [ '' ],
  toStringArray07: [ ],
  toStringArray08: null,
  toStringArray09: undefined,
  toNumberArray01: '1',
  toNumberArray02: [ '1', '2' ],
  toNumberArray03: '1,2|3',
  toNumberArray04: [ '1;2', '2', 'x' ],
  toNumberArray05: [ '1,2', '3' ],
  toNumberArray06: [ 'x' ],
  toNumberArray07: [ ],
  toNumberArray08: null,
  toNumberArray09: undefined,
};

describe('ToBoolean', () => {
  it('should transform a primitive to boolean', () => {
    const dto = plainToClass(TransformDto, transformSubject);
    expect(dto.toBoolean01).toStrictEqual(true);
    expect(dto.toBoolean02).toStrictEqual(false);
    expect(dto.toBoolean03).toStrictEqual(true);
    expect(dto.toBoolean04).toStrictEqual(false);
    expect(dto.toBoolean05).toStrictEqual(true);
    expect(dto.toBoolean06).toStrictEqual(false);
    expect(dto.toBoolean07).toStrictEqual(null);
    expect(dto.toBoolean08).toStrictEqual(null);
    expect(dto.toBoolean09).toStrictEqual(undefined);
  });
});

describe('ToNumber', () => {
  it('should transform a primitive to number', () => {
    const dto = plainToClass(TransformDto, transformSubject);
    expect(dto.toNumber01).toStrictEqual(123);
    expect(dto.toNumber02).toStrictEqual(123.456);
    expect(dto.toNumber03).toStrictEqual(123);
    expect(dto.toNumber04).toStrictEqual(123.456);
    expect(dto.toNumber05).toStrictEqual(1);
    expect(dto.toNumber06).toStrictEqual(0);
    expect(dto.toNumber07).toStrictEqual(null);
    expect(dto.toNumber08).toStrictEqual(null);
    expect(dto.toNumber09).toStrictEqual(undefined);
  });
});

describe('ToString', () => {
  it('should transform to string and obey desired case', () => {
    const dto = plainToClass(TransformDto, transformSubject);

    expect(dto.toString01).toStrictEqual('lower case');
    expect(dto.toString02).toStrictEqual('UPPER CASE');
    expect(dto.toString03).toStrictEqual('Title Case');
    expect(dto.toString04).toStrictEqual('');
    expect(dto.toString05).toStrictEqual('0');
    expect(dto.toString06).toStrictEqual('1');
    expect(dto.toString07).toStrictEqual('true');
    expect(dto.toString08).toStrictEqual(null);
    expect(dto.toString09).toStrictEqual(undefined);
  });
});

describe('ToStringArray', () => {
  it('should transform separated strings or array of strings into an array of unique strings', () => {
    const dto = plainToClass(TransformDto, transformSubject);

    expect(dto.toStringArray01).toStrictEqual([ 'a' ]);
    expect(dto.toStringArray02).toStrictEqual([ 'a', 'b' ]);
    expect(dto.toStringArray03).toStrictEqual([ 'a', 'b', 'c' ]);
    expect(dto.toStringArray04).toStrictEqual([ 'a', 'b' ]);
    expect(dto.toStringArray05).toStrictEqual([ 'a', 'b', 'c' ]);
    expect(dto.toStringArray06).toStrictEqual([ '' ]);
    expect(dto.toStringArray07).toStrictEqual([ ]);
    expect(dto.toStringArray08).toStrictEqual([ ]);
    expect(dto.toStringArray09).toStrictEqual(undefined);
  });
});

describe('ToNumberArray', () => {
  it('should transform separated strings or array of strings into an array of unique numbers', () => {
    const dto = plainToClass(TransformDto, transformSubject);

    expect(dto.toNumberArray01).toStrictEqual([ 1 ]);
    expect(dto.toNumberArray02).toStrictEqual([ 1, 2 ]);
    expect(dto.toNumberArray03).toStrictEqual([ 1, 2, 3 ]);
    expect(dto.toNumberArray04).toStrictEqual([ 1, 2, Number.NaN ]);
    expect(dto.toNumberArray05).toStrictEqual([ 1, 2, 3 ]);
    expect(dto.toNumberArray06).toStrictEqual([ Number.NaN ]);
    expect(dto.toNumberArray07).toStrictEqual([ ]);
    expect(dto.toNumberArray08).toStrictEqual([ ]);
    expect(dto.toNumberArray09).toStrictEqual(undefined);
  });
});
