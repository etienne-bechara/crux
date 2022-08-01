/* eslint-disable max-len */
import { ValidationError } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { IsString, OneOf } from './validate.decorator';

class OneOfDto {

  @OneOf('group1')
  @IsString()
  public oneOf1?: string;

  @OneOf('group1')
  @IsString()
  public oneOf2?: string;

  @OneOf('group2')
  @IsString()
  public oneOf3?: string;

  @OneOf('group2')
  @IsString()
  public oneOf4?: string;

  @OneOf('group2')
  @IsString()
  public oneOf5?: string;

}

const oneOfValidator = (obj): ValidationError[] => validateSync(plainToClass(OneOfDto, obj));

describe('ValidatorDecorator', () => {
  describe('OneOf', () => {
    it('should require group2', () => {
      const scenario = oneOfValidator({ oneOf1: 'set' });
      expect(scenario.length).toBe(2);
      expect(scenario[0].constraints.MutuallyExclusive).toBe('one of oneOf3, oneOf4, oneOf5 must be defined');
      expect(scenario[1].constraints.MutuallyExclusive).toBe('one of oneOf3, oneOf4, oneOf5 must be defined');
    });

    it('should complain group1 and require group2', () => {
      const scenario = oneOfValidator({ oneOf1: 'set', oneOf2: 'set' });
      expect(scenario.length).toBe(3);
      expect(scenario[0].constraints.MutuallyExclusive).toBe('properties oneOf1, oneOf2 are mutually exclusive');
      expect(scenario[1].constraints.MutuallyExclusive).toBe('one of oneOf3, oneOf4, oneOf5 must be defined');
      expect(scenario[2].constraints.MutuallyExclusive).toBe('one of oneOf3, oneOf4, oneOf5 must be defined');
    });

    it('should pass', () => {
      const scenario = oneOfValidator({ oneOf2: 'set', oneOf3: 'set' });
      expect(scenario.length).toBe(0);
    });

    it('should complain group1', () => {
      const scenario = oneOfValidator({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set' });
      expect(scenario.length).toBe(1);
      expect(scenario[0].constraints.MutuallyExclusive).toBe('properties oneOf1, oneOf2 are mutually exclusive');
    });

    it('should complain group2', () => {
      const scenario = oneOfValidator({ oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(scenario.length).toBe(1);
      expect(scenario[0].constraints.MutuallyExclusive).toBe('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });

    it('should complain group1 and complain group2', () => {
      const scenario = oneOfValidator({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf4: 'set' });
      expect(scenario.length).toBe(2);
      expect(scenario[0].constraints.MutuallyExclusive).toBe('properties oneOf1, oneOf2 are mutually exclusive');
      expect(scenario[1].constraints.MutuallyExclusive).toBe('properties oneOf3, oneOf4, oneOf5 are mutually exclusive');
    });
  });
});
