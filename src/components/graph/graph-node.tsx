import formIcon from "@/assets/form.png";
import { Handle, Position } from "@xyflow/react";

interface GraphNodeProps {
  data: {
    label: string;
  };
}

export const GraphNode = ({ data }: GraphNodeProps) => {
  return (
    <div className="flex items-center justify-start gap-3 bg-white rounded-md p-2 border w-64">
      <div className="w-10 h-10">
        <img
          src={formIcon}
          alt="icon"
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex flex-col items-start justify-start">
        <p className="text-sm text-gray-500">Form</p>
        <p className="text-lg">{data.label}</p>
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
