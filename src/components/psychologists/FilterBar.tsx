"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { conditionsList, languagesList } from "@/lib/data";

export interface FilterState {
  location: string[];
  insurance: string[];
  language: string[];
  conditions: string[];
  priceRange: string[];
  ethnicity: string[];
}

interface FilterBarProps {
  activeFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

export default function FilterBar({ activeFilters, onApplyFilters }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(activeFilters);

  // Sync local state when activeFilters change (e.g. if reset externally)
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  // Sync local state when drawer opens to ensure fresh start if cancelled previously
  useEffect(() => {
    if (open) {
      setLocalFilters(activeFilters);
    }
  }, [open, activeFilters]);

  const handleCheckboxChange = (category: keyof FilterState, value: string, checked: boolean) => {
    setLocalFilters((prev) => {
      const current = prev[category];
      const updated = checked
        ? [...current, value]
        : current.filter((item) => item !== value);
      return { ...prev, [category]: updated };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const FilterContent = () => (
    <div className="flex flex-col h-full bg-white text-[#2F3A4A] select-none">
       {/* Header */}
       <SheetHeader className="px-6 py-[18px] border-b border-[#EFEFEF] flex flex-row items-center justify-between sticky top-0 bg-white z-20 shrink-0">
          <SheetTitle className="text-[18px] font-semibold text-[#2F3A4A]">Filters</SheetTitle>
           <SheetClose className="opacity-70 hover:opacity-100 transition-opacity focus:outline-none ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
             <X size={20} className="text-[#2F3A4A]" />
             <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-20 scrollbar-thin scrollbar-thumb-gray-200">
          <Accordion type="multiple" defaultValue={["location", "conditions"]} className="w-full space-y-2">
            
            {/* Location (New) */}
            <AccordionItem value="location" className="border-b border-[#F0F0F0] px-1">
                 <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-medium text-[#2F3A4A] [&[data-state=open]>svg]:rotate-180">
                    Location
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 pb-5 pt-1">
                        {["Online / Remote", "United States", "United Kingdom", "Canada", "Australia", "Somalia", "Kenya", "Turkey", "Saudi Arabia", "China", "India", "Brazil", "Germany", "France", "Japan"].map((loc) => (
                             <div key={loc} className="flex items-center space-x-3">
                                <Checkbox 
                                    id={`filter-loc-${loc}`} 
                                    className="border-[#CFCFCF] rounded-[4px] w-[18px] h-[18px] data-[state=checked]:bg-[#5D4B8E] data-[state=checked]:border-[#5D4B8E] data-[state=checked]:text-white"
                                    checked={localFilters.location.includes(loc)}
                                    onCheckedChange={(checked) => handleCheckboxChange("location", loc, checked as boolean)}
                                />
                                <Label htmlFor={`filter-loc-${loc}`} className="text-[14px] font-normal text-[#2F3A4A] leading-none cursor-pointer truncate" title={loc}>{loc}</Label>
                            </div>
                        ))}
                    </div>
                 </AccordionContent>
            </AccordionItem>

            {/* Insurance */}
            <AccordionItem value="insurance" className="border-b border-[#F0F0F0] px-1">
                 <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-medium text-[#2F3A4A] [&[data-state=open]>svg]:rotate-180">
                    Insurance
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 pb-5 pt-1">
                        {["Aetna", "Blue Cross", "Cigna", "UnitedHealthcare", "Medicare"].map((ins) => (
                             <div key={ins} className="flex items-center space-x-3">
                                <Checkbox 
                                    id={`filter-insurance-${ins}`} 
                                    className="border-[#CFCFCF] rounded-[4px] w-[18px] h-[18px] data-[state=checked]:bg-[#5D4B8E] data-[state=checked]:border-[#5D4B8E] data-[state=checked]:text-white" 
                                    checked={localFilters.insurance.includes(ins)}
                                    onCheckedChange={(checked) => handleCheckboxChange("insurance", ins, checked as boolean)}
                                />
                                <Label htmlFor={`filter-insurance-${ins}`} className="text-[14px] font-normal text-[#2F3A4A] leading-none cursor-pointer truncate" title={ins}>{ins}</Label>
                            </div>
                        ))}
                    </div>
                 </AccordionContent>
            </AccordionItem>

             {/* Language */}
             <AccordionItem value="language" className="border-b border-[#F0F0F0] px-1">
                 <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-medium text-[#2F3A4A]">
                    Language
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="pb-5 pt-1 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                            {languagesList.slice(0, 6).map((lang) => (
                                <div key={lang} className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={`filter-lang-${lang}`} 
                                        className="border-[#CFCFCF] rounded-[4px] w-[18px] h-[18px] data-[state=checked]:bg-[#5D4B8E] data-[state=checked]:border-[#5D4B8E] data-[state=checked]:text-white" 
                                        checked={localFilters.language.includes(lang)}
                                        onCheckedChange={(checked) => handleCheckboxChange("language", lang, checked as boolean)}
                                    />
                                    <Label htmlFor={`filter-lang-${lang}`} className="text-[14px] font-normal text-[#2F3A4A] leading-none cursor-pointer">{lang}</Label>
                                </div>
                            ))}
                        </div>
                        <button className="text-[13px] text-[#2D8B96] hover:text-[#247079] hover:underline font-medium w-fit">
                            More Languages
                        </button>
                    </div>
                 </AccordionContent>
            </AccordionItem>

            {/* Conditions */}
            <AccordionItem value="conditions" className="border-b border-[#F0F0F0] px-1">
                 <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-medium text-[#2F3A4A]">
                    Conditions
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="pb-5 pt-1 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                            {conditionsList.slice(0, 8).map((c) => (
                                <div key={c} className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={`filter-cond-${c}`} 
                                        className="border-[#CFCFCF] rounded-[4px] w-[18px] h-[18px] data-[state=checked]:bg-[#5D4B8E] data-[state=checked]:border-[#5D4B8E] data-[state=checked]:text-white" 
                                        checked={localFilters.conditions.includes(c)}
                                        onCheckedChange={(checked) => handleCheckboxChange("conditions", c, checked as boolean)}
                                    />
                                    <Label htmlFor={`filter-cond-${c}`} className="text-[14px] font-normal text-[#2F3A4A] leading-none cursor-pointer truncate" title={c}>{c}</Label>
                                </div>
                            ))}
                        </div>
                        <button className="text-[13px] text-[#2D8B96] hover:text-[#247079] hover:underline font-medium w-fit">
                            More Issues
                        </button>
                    </div>
                 </AccordionContent>
            </AccordionItem>

            {/* Price Range */}
             <AccordionItem value="price range" className="border-b border-[#F0F0F0] px-1">
                 <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-medium text-[#2F3A4A]">
                    Price Range
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="grid grid-cols-1 gap-y-3.5 pb-5 pt-1">
                        {[
                            { label: "$ (Less than $50)", val: "low" },
                            { label: "$$ ($50-$60)", val: "mid" },
                            { label: "$$$ (More than $60)", val: "high" }
                        ].map((price) => (
                             <div key={price.val} className="flex items-center space-x-3">
                                <Checkbox 
                                    id={`filter-price-${price.val}`} 
                                    className="border-[#CFCFCF] rounded-[4px] w-[18px] h-[18px] data-[state=checked]:bg-[#5D4B8E] data-[state=checked]:border-[#5D4B8E] data-[state=checked]:text-white" 
                                    checked={localFilters.priceRange.includes(price.val)}
                                    onCheckedChange={(checked) => handleCheckboxChange("priceRange", price.val, checked as boolean)}
                                />
                                <Label htmlFor={`filter-price-${price.val}`} className="text-[14px] font-normal text-[#2F3A4A] leading-none cursor-pointer">{price.label}</Label>
                            </div>
                        ))}
                    </div>
                 </AccordionContent>
            </AccordionItem>

             {/* Ethnicity */}
             <AccordionItem value="ethnicity" className="border-b border-[#F0F0F0] px-1">
                 <AccordionTrigger className="hover:no-underline py-4 text-[15px] font-medium text-[#2F3A4A]">
                    Ethnicity
                 </AccordionTrigger>
                 <AccordionContent>
                    <div className="pb-5 pt-1 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                            {["White", "Black/African American", "Hispanic", "Asian", "Native"].map((eth) => (
                                <div key={eth} className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={`filter-ethnicity-${eth}`} 
                                        className="border-[#CFCFCF] rounded-[4px] w-[18px] h-[18px] data-[state=checked]:bg-[#5D4B8E] data-[state=checked]:border-[#5D4B8E] data-[state=checked]:text-white" 
                                        checked={localFilters.ethnicity.includes(eth)}
                                        onCheckedChange={(checked) => handleCheckboxChange("ethnicity", eth, checked as boolean)}
                                    />
                                    <Label htmlFor={`filter-ethnicity-${eth}`} className="text-[14px] font-normal text-[#2F3A4A] leading-none cursor-pointer truncate" title={eth}>{eth}</Label>
                                </div>
                            ))}
                        </div>
                        <button className="text-[13px] text-[#2D8B96] hover:text-[#247079] hover:underline font-medium w-fit">
                            More Ethnicities
                        </button>
                    </div>
                 </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
        
        {/* Footer Actions */}
        <SheetFooter className="absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-[#F0F0F0] flex flex-row justify-start items-center gap-3 z-30 rounded-b-2xl">
             <Button onClick={handleApply} variant="default" className="bg-[#5D4B8E] hover:bg-[#4b3c75] text-white h-[44px] px-[22px] rounded-xl text-[15px] font-medium shadow-none transition-colors">
                Filter
             </Button>
             <SheetClose asChild>
                <Button variant="outline" className="bg-white border-[#D7D7D7] text-[#2F3A4A] h-[44px] px-[22px] rounded-xl text-[15px] font-medium hover:bg-gray-50 transition-colors shadow-none">
                    Cancel
                </Button>
            </SheetClose>
        </SheetFooter>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6 h-full">
      {/* Shared Filters Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Triggers */}
        <div className="flex flex-wrap gap-2">
            <SheetTrigger asChild>
               <Button variant="outline" className="h-[42px] px-4 rounded-xl border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-semibold text-sm flex items-center gap-2 transition-all">
                Location
                <ChevronDown size={16} />
              </Button>
            </SheetTrigger>

            <SheetTrigger asChild>
                <Button variant="outline" className="h-[42px] px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-sm flex items-center gap-2">
                    Conditions {activeFilters.conditions.length > 0 && <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">{activeFilters.conditions.length}</span>}
                    <ChevronDown size={16} className="text-slate-400" />
                </Button>
            </SheetTrigger>
            
            <SheetTrigger asChild>
                 <Button variant="outline" className="h-[42px] px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-sm flex items-center gap-2">
                    Insurance
                    <ChevronDown size={16} className="text-slate-400" />
                </Button>
            </SheetTrigger>

             <SheetTrigger asChild>
                 <Button variant="outline" className="h-[42px] px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-sm flex items-center gap-2">
                    Language
                    <ChevronDown size={16} className="text-slate-400" />
                </Button>
            </SheetTrigger>

             <SheetTrigger asChild>
                 <Button variant="outline" className="h-[42px] px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-sm flex items-center gap-2">
                    Price
                    <ChevronDown size={16} className="text-slate-400" />
                </Button>
            </SheetTrigger>

             <SheetTrigger asChild>
                 <Button variant="outline" className="h-[42px] px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-sm flex items-center gap-2">
                    Ethnicity
                    <ChevronDown size={16} className="text-slate-400" />
                </Button>
            </SheetTrigger>

             <SheetTrigger asChild>
                 <Button variant="ghost" className="h-[42px] px-4 text-slate-500 hover:bg-slate-50 font-medium text-sm flex items-center gap-2">
                    <SlidersHorizontal size={16} /> All Filters
                </Button>
            </SheetTrigger>
        </div>

        {/* Floating Card Content */}
        <SheetContent 
            side="right" 
            showClose={false}
            className="w-[400px] sm:max-w-[400px] h-auto max-h-[80vh] mr-4 mb-4 ml-4 mt-28 rounded-2xl border border-[#E6E6E6] shadow-[0_12px_30px_rgba(0,0,0,0.12)] p-0 gap-0 overflow-hidden bg-white z-[60]"
        >
            <FilterContent />
        </SheetContent>
      </Sheet>

    </div>
  );
}
