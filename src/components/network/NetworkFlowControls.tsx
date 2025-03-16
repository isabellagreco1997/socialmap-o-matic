import { Background, Controls, BackgroundVariant } from '@xyflow/react';

const NetworkFlowControls = () => {
  return (
    <>
      <Background
        color="#e5e7eb"
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
      />
      <Controls />
    </>
  );
};

export default NetworkFlowControls;
