/* eslint-disable max-len */
import { ValidationError } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, validateSync } from 'class-validator';

import { IsConditional, OneOf } from './validate.decorator';

class OneOfDto {

  @OneOf('group1')
  public oneOf1?: string;

  @OneOf('group1')
  public oneOf2?: string;

  @OneOf('group2')
  public oneOf3?: string;

  @OneOf('group2')
  public oneOf4?: string;

  @OneOf('group2')
  public oneOf5?: string;

}

class IsConditionalDto {

  @IsOptional()
  @IsString() @IsNotEmpty()
  public isConditional1: string;

  @IsConditional((o) => o.isConditional1)
  public isConditional2: string;

  @IsConditional((o) => !o.isConditional1)
  public isConditional3: string;

}

const oneOfValidator = (obj): ValidationError[] => validateSync(plainToClass(OneOfDto, obj));
const isConditionalValidator = (obj): ValidationError[] => validateSync(plainToClass(IsConditionalDto, obj));

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

  describe('IsConditional', () => {
    it('should require isConditional2', () => {
      const scenario = isConditionalValidator({ isConditional1: 'set' });
      expect(scenario.length).toBe(1);
      expect(scenario[0].constraints.IsConditional).toBe('property isConditional2 should exist');
    });

    it('should pass', () => {
      const scenario = isConditionalValidator({ isConditional1: 'set', isConditional2: 'set' });
      expect(scenario.length).toBe(0);
    });

    it('should require isConditional2 and complain isConditional3', () => {
      const scenario = isConditionalValidator({ isConditional1: 'set', isConditional3: 'set' });
      expect(scenario.length).toBe(2);
      expect(scenario[0].constraints.IsConditional).toBe('property isConditional2 should exist');
      expect(scenario[1].constraints.IsConditional).toBe('property isConditional3 should not exist');
    });

    it('should complain isConditional2', () => {
      const scenario = isConditionalValidator({ isConditional2: 'set', isConditional3: 'set' });
      expect(scenario.length).toBe(1);
      expect(scenario[0].constraints.IsConditional).toBe('property isConditional2 should not exist');
    });

    it('should complain isConditional3', () => {
      const scenario = isConditionalValidator({ isConditional1: 'set', isConditional2: 'set', isConditional3: 'set' });
      expect(scenario.length).toBe(1);
      expect(scenario[0].constraints.IsConditional).toBe('property isConditional3 should not exist');
    });
  });
});
