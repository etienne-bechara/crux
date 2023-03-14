/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable max-len */
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { IsString, OneOf } from './validate.decorator';

class OneOfGroupsOf2And3Dto {

  @OneOf('ONE_OF_GROUPS_OF_2_AND_3_1')
  @IsString()
  public oneOf1?: string;

  @OneOf('ONE_OF_GROUPS_OF_2_AND_3_1')
  @IsString()
  public oneOf2?: string;

  @OneOf('ONE_OF_GROUPS_OF_2_AND_3_2')
  @IsString()
  public oneOf3?: string;

  @OneOf('ONE_OF_GROUPS_OF_2_AND_3_2')
  @IsString()
  public oneOf4?: string;

  @OneOf('ONE_OF_GROUPS_OF_2_AND_3_2')
  @IsString()
  public oneOf5?: string;

}

class OneOfGroupOf5Dto {

  @OneOf('ONE_OF_GROUP_OF_5')
  @IsString()
  public oneOf1?: string;

  @OneOf('ONE_OF_GROUP_OF_5')
  @IsString()
  public oneOf2?: string;

  @OneOf('ONE_OF_GROUP_OF_5')
  @IsString()
  public oneOf3?: string;

  @OneOf('ONE_OF_GROUP_OF_5')
  @IsString()
  public oneOf4?: string;

  @OneOf('ONE_OF_GROUP_OF_5')
  @IsString()
  public oneOf5?: string;

}

function oneOfValidatorGroupsOf2And3(obj: unknown): string[] {
  const constraints: string[] = [ ];
  const errors = validateSync(plainToClass(OneOfGroupsOf2And3Dto, obj));

  for (const error of errors) {
    for (const key in error.constraints) {
      constraints.push(error.constraints[key]);
    }
  }

  return constraints;
}

function oneOfValidatorGroupOf5(obj: unknown): string[] {
  const constraints: string[] = [ ];
  const errors = validateSync(plainToClass(OneOfGroupOf5Dto, obj));

  for (const error of errors) {
    for (const key in error.constraints) {
      constraints.push(error.constraints[key]);
    }
  }

  return constraints;
}

describe('OneOf | Groups of 2 and 3', () => {
  describe('Zero properties set', () => {
    it('{ }', () => {
      const constraints = oneOfValidatorGroupsOf2And3({ });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
      expect(constraints).toContain('one of oneOf3, oneOf4, oneOf5 must be defined');
    });
  });

  describe('One property set', () => {
    it("{ oneOf1: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set' });
      expect(constraints).toContain('one of oneOf3, oneOf4, oneOf5 must be defined');
    });

    it("{ oneOf2: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set' });
      expect(constraints).toContain('one of oneOf3, oneOf4, oneOf5 must be defined');
    });

    it("{ oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf3: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
    });

    it("{ oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf4: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
    });

    it("{ oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf5: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
    });
  });

  describe('Two properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
      expect(constraints).toContain('one of oneOf3, oneOf4, oneOf5 must be defined');
    });

    it("{ oneOf1: 'set', oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf3: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf1: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf4: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf1: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf5: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf2: 'set', oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf3: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf2: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf4: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf2: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf5: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });

  describe('Three properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf2: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf2: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('one of oneOf1, oneOf2 must be defined');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });

  describe('Four properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });

  describe('Five properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupsOf2And3({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2 are mutually exclusive');
      expect(constraints).toContain('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });
});

describe('OneOf | Group of 5', () => {
  describe('Zero properties set', () => {
    it('{ }', () => {
      const constraints = oneOfValidatorGroupOf5({ });
      expect(constraints).toContain('one of oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 must be defined');
    });
  });

  describe('One property set', () => {
    it("{ oneOf1: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf2: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf3: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf4: 'set' });
      expect(constraints.length).toBe(0);
    });

    it("{ oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf5: 'set' });
      expect(constraints.length).toBe(0);
    });
  });

  describe('Two properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf3: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf3: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });

  describe('Three properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf2: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf2: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });

  describe('Four properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it("{ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });

  describe('Five properties set', () => {
    it("{ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' }", () => {
      const constraints = oneOfValidatorGroupOf5({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      expect(constraints).toContain('properties oneOf1, oneOf2, oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });
});
