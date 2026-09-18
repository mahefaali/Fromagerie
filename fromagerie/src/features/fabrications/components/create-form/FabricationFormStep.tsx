import type { ReactNode } from "react";

import { CoagulationStep, FabricationStartStep, MilkStep } from "./FabricationProcessSteps";
import { MoldingStep, OutputStep } from "./FabricationFinishingSteps";
import type { FabricationFormStepProps } from "./fabricationFormStep.types";

export function FabricationFormStep(props: FabricationFormStepProps): ReactNode {
  switch (props.currentStep) {
    case 0:
      return <FabricationStartStep {...props} />;
    case 1:
      return <MilkStep {...props} />;
    case 2:
      return <CoagulationStep {...props} />;
    case 3:
      return <MoldingStep {...props} />;
    default:
      return <OutputStep {...props} />;
  }
}
