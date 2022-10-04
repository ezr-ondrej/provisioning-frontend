import React from 'react';
import { Slider } from '@patternfly/react-core';
import { useWizardContext } from '../Common/WizardContext';
const MAX_INSTANCES = 20;
const MIN_INSTANCES = 1;

const InstanceCounter = () => {
  const [wizardContext, setWizardContext] = useWizardContext();
  const onChange = (value, inputValue, setLocalInputValue) => {
    let newValue;
    if (inputValue === undefined) {
      newValue = Number(value);
    } else {
      newValue = Math.max(MIN_INSTANCES, Math.min(inputValue, MAX_INSTANCES));
      newValue = Math.floor(inputValue);

      setLocalInputValue(newValue);
    }
    setWizardContext((prevState) => ({
      ...prevState,
      chosenNumOfInstances: newValue,
    }));
  };
  return (
    <Slider
      max={MAX_INSTANCES}
      min={MIN_INSTANCES}
      value={wizardContext.chosenNumOfInstances}
      isInputVisible
      inputValue={wizardContext.chosenNumOfInstances}
      hasTooltipOverThumb
      onChange={onChange}
    />
  );
};
export default InstanceCounter;
