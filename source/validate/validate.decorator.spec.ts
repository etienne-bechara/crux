import { ValidationError } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { OneOf } from './validate.decorator';

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

  @OneOf('group3')
  public oneOf6?: string;

}

const oneOfValidator = (obj): ValidationError[] => validateSync(plainToClass(OneOfDto, obj));

describe('ValidatorDecorator', () => {
  describe('OneOf', () => {
    it('should obey one of groups', () => {
      const scenario1 = oneOfValidator({ oneOf3: 'set' });
      const scenario2 = oneOfValidator({ oneOf1: 'set', oneOf6: 'set' });
      const scenario3 = oneOfValidator({ oneOf1: 'set', oneOf3: 'set', oneOf6: 'set' });
      const scenario4 = oneOfValidator({ oneOf1: 'set', oneOf2: 'set' });
      const scenario5 = oneOfValidator({ oneOf3: 'set', oneOf4: 'set', oneOf5: 'set' });
      const scenario6 = oneOfValidator({ oneOf1: 'set', oneOf2: 'set', oneOf3: 'set', oneOf5: 'set' });

      expect(scenario1.length).toBeTruthy(); // Missing groups 1 and 3
      expect(scenario2.length).toBeTruthy(); // Missing group 2
      expect(scenario3.length).toBeFalsy(); // OK
      expect(scenario4.length).toBeTruthy(); // Missing groups 2 and 3, conflict on group 1
      expect(scenario5.length).toBeTruthy(); // Missing groups 1 and 3, conflict on group 2
      expect(scenario6.length).toBeTruthy(); // Conflict on group 1
    });
  });
});
