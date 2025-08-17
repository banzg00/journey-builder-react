import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActionBlueprintGraph } from "@/context/actionBlueprintGraphContext";
import { DataOption, DependencyData } from "@/types/internal";
import { buildDataSections } from "@/utils/util";

interface FieldSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionSelect: (option: DataOption) => void;
  dependencyData: DependencyData;
}

export function FieldSelectionModal({
  isOpen,
  onClose,
  onOptionSelect,
  dependencyData,
}: FieldSelectionModalProps) {
  const { state } = useActionBlueprintGraph();
  const dataSections = buildDataSections(dependencyData, state.globalData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select data element to map</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <Accordion type="multiple" className="w-full">
            {dataSections.map((section, sectionIndex) => (
              <AccordionItem
                key={section.title}
                value={`section-${sectionIndex}`}
              >
                <AccordionTrigger className="text-base font-medium text-gray-700 hover:text-gray-900 hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-1 pt-2">
                    {section.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onOptionSelect(option)}
                        className="flex items-center justify-start w-full p-3 text-left hover:bg-gray-50 rounded-md border border-gray-200 hover:border-gray-200 transition-all duration-150"
                      >
                        <span className="text-base text-gray-700 hover:text-gray-900">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <DialogFooter className="mt-4 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
