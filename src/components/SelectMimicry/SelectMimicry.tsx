import React, { FunctionComponent, HTMLAttributes } from 'react';
import classNames from '../../lib/classNames';
import Icon24Dropdown from '@vkontakte/icons/dist/24/dropdown';
import Icon20Dropdown from '@vkontakte/icons/dist/20/dropdown';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import FormField from '../FormField/FormField';
import { HasAlign, HasFormLabels, HasFormStatus, HasRootRef } from '../../types';
import withAdaptivity, { AdaptivityProps, SizeType } from '../../hoc/withAdaptivity';

export interface SelectMimicryProps extends
  HTMLAttributes<HTMLElement>,
  HasAlign,
  HasFormStatus,
  HasFormLabels,
  HasRootRef<HTMLElement>,
  AdaptivityProps {
  multiline?: boolean;
  disabled?: boolean;
}

const SelectMimicry: FunctionComponent<SelectMimicryProps> = ({
  className,
  tabIndex,
  placeholder,
  children,
  align,
  status,
  getRootRef,
  multiline,
  disabled,
  onClick,
  sizeX,
  sizeY,
  ...restProps
}: SelectMimicryProps) => {
  return (
    <FormField
      {...restProps}
      tabIndex={disabled ? null : tabIndex}
      className={classNames('Select', 'Select--mimicry', {
        'Select--not-selected': !children,
        'Select--multiline': multiline,
        'Select--disabled': disabled,
        [`Select--align-${align}`]: !!align,
        [`Select--sizeX--${sizeX}`]: !!sizeX,
        [`Select--sizeY--${sizeY}`]: !!sizeY,
      }, className)}
      getRootRef={getRootRef}
      status={status}
      onClick={disabled ? null : onClick}
    >
      <div className="Select__container">
        <div className="Select__title">{children || placeholder}</div>
        {sizeX === SizeType.COMPACT ? <Icon16Dropdown /> : sizeY === SizeType.COMPACT ? <Icon20Dropdown /> : <Icon24Dropdown />}
      </div>
    </FormField>
  );
};

SelectMimicry.defaultProps = {
  tabIndex: 0,
};

export default withAdaptivity(SelectMimicry, {
  sizeX: true,
  sizeY: true,
});

