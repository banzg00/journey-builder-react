import databaseIcon from "@/assets/database-icon.svg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActionBlueprintGraph } from "@/context/actionBlueprintGraphContext";
import { DataOption, DependencyData, FieldMapping } from "@/types/internal";
import { ACTION_BLUEPRINT_GRAPH_ACTION } from "@/types/state";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { FieldSelectionModal } from "./field-selection-modal";

interface PrefillFormProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    formFields: string[];
    dependencyData: DependencyData;
  };
  nodeId: string;
  initialFieldMappings: Record<string, FieldMapping>;
}

export function PrefillForm({
  isOpen,
  onClose,
  data,
  nodeId,
  initialFieldMappings,
}: PrefillFormProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] =
    useState<Record<string, FieldMapping>>(initialFieldMappings);

  const { dispatch } = useActionBlueprintGraph();

  // Sync local state with initial field mappings when nodeId changes
  useEffect(() => {
    setFieldMappings(initialFieldMappings);
  }, [nodeId, initialFieldMappings]);

  const handleFieldClick = (field: string) => {
    setSelectedField(field);
  };

  const handleOptionSelect = (option: DataOption) => {
    if (selectedField) {
      const mapping = {
        label: option.label,
        value: option.value,
        source: option.source,
      };

      dispatch({
        type: ACTION_BLUEPRINT_GRAPH_ACTION.UPDATE_FORM_FIELD_MAPPING,
        payload: {
          nodeId,
          fieldName: selectedField,
          mapping,
        },
      });
    }
    setSelectedField(null);
  };

  const handleRemoveMapping = (field: string) => {
    dispatch({
      type: ACTION_BLUEPRINT_GRAPH_ACTION.REMOVE_FORM_FIELD_MAPPING,
      payload: {
        nodeId,
        fieldName: field,
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Prefill Form</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {data.formFields.map((field: string) => {
              const mappedValue = fieldMappings[field];

              if (mappedValue) {
                return (
                  <div
                    key={field}
                    className="flex items-center bg-gray-100 justify-between w-full h-9 p-2 border rounded-xl"
                  >
                    <span className="text-sm font-medium">
                      {mappedValue.source}.{mappedValue.label}
                    </span>
                    <button
                      onClick={() => handleRemoveMapping(field)}
                      className="text-sm w-5 h-5 leading-none cursor-pointer hover:rounded-full hover:bg-gray-300"
                      title="Remove mapping"
                    >
                      ×
                    </button>
                  </div>
                );
              }

              return (
                <Button
                  key={field}
                  variant="outline"
                  className="flex items-center justify-start gap-2 w-full bg-gray-100 text-gray-500 font-normal border rounded-md p-2 border-dashed hover:border-blue-500 hover:bg-blue-50 hover:text-gray-500 cursor-pointer"
                  onClick={() => handleFieldClick(field)}
                >
                  <img src={databaseIcon} alt="database" className="w-4 h-4" />
                  <span>{field}</span>
                </Button>
              );
            })}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FieldSelectionModal
        isOpen={!!selectedField}
        onClose={() => setSelectedField(null)}
        onOptionSelect={handleOptionSelect}
        dependencyData={
          data.dependencyData || {
            directDependencies: [],
            transitiveDependencies: [],
          }
        }
      />
    </>
  );
}
