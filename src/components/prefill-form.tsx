import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import databaseIcon from "../assets/database-icon.svg";
import { Button } from "../components/ui/button";

// Organized data options by category
const DATA_SECTIONS = [
  {
    title: "Personal Information",
    options: [
      "First Name",
      "Last Name",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Date of Birth",
      "Social Security Number",
    ],
  },
  {
    title: "Company & Work",
    options: [
      "Company Name",
      "Department",
      "Job Title",
      "Employee ID",
      "Manager Name",
      "Work Email",
      "Work Phone",
    ],
  },
  {
    title: "Address & Location",
    options: [
      "Street Address",
      "City",
      "State/Province",
      "Country",
      "Postal Code",
      "Home Address",
      "Work Address",
    ],
  },
  {
    title: "System & Technical",
    options: [
      "User ID",
      "Username",
      "Account Number",
      "Reference ID",
      "System Role",
      "Access Level",
    ],
  },
  {
    title: "Financial",
    options: [
      "Bank Account",
      "Routing Number",
      "Credit Card",
      "Payment Method",
      "Billing Address",
      "Tax ID",
    ],
  },
];

export function PrefillForm({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: {
    formFields: string[];
  };
}) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>(
    {}
  );

  const handleFieldClick = (field: string) => {
    // If field is already mapped, don't open selection dialog
    if (fieldMappings[field]) return;
    setSelectedField(field);
  };

  const handleOptionSelect = (option: string) => {
    if (selectedField) {
      setFieldMappings((prev) => ({
        ...prev,
        [selectedField]: option,
      }));
    }
    setSelectedField(null);
  };

  const handleRemoveMapping = (field: string) => {
    setFieldMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[field];
      return newMappings;
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
                // Show as populated div with remove button
                return (
                  <div
                    key={field}
                    className="flex items-center bg-gray-100 justify-between w-full h-9 p-2 border rounded-xl"
                  >
                    <span className="text-sm font-medium">
                      {field}: {mappedValue}
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

              // Show as clickable button
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

      {/* Selection Dialog */}
      <Dialog
        open={!!selectedField}
        onOpenChange={() => setSelectedField(null)}
      >
        <DialogContent className="max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select data element to map</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <Accordion type="multiple" className="w-full">
              {DATA_SECTIONS.map((section, sectionIndex) => (
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
                          key={option}
                          onClick={() => handleOptionSelect(option)}
                          className="flex items-center justify-start w-full p-3 text-left hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-all duration-150"
                        >
                          <span className="text-base text-gray-700 hover:text-gray-900">
                            {option}
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
    </>
  );
}
