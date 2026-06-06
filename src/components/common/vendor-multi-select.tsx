"use client"

import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Vendor = { id: string; name: string; category?: string | null }

export function VendorMultiSelect({
  vendors,
  value,
  onChange,
}: {
  vendors: Vendor[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  const selected = vendors.filter((v) => value.includes(v.id))
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }
  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="text-muted-foreground">
            {selected.length === 0
              ? "Select vendors…"
              : `${selected.length} selected`}
          </span>
          <IconChevronDown className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search vendors…" />
            <CommandList>
              <CommandEmpty>No vendors found.</CommandEmpty>
              <CommandGroup>
                {vendors.map((v) => {
                  const active = value.includes(v.id)
                  return (
                    <CommandItem
                      key={v.id}
                      value={`${v.name} ${v.category ?? ""}`}
                      onSelect={() => toggle(v.id)}
                    >
                      <IconCheck
                        className={cn("size-4", active ? "opacity-100" : "opacity-0")}
                      />
                      <span className="flex-1">{v.name}</span>
                      {v.category && (
                        <span className="text-xs text-muted-foreground">
                          {v.category}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((v) => (
            <Badge key={v.id} variant="secondary" className="gap-1">
              {v.name}
              <button
                type="button"
                onClick={() => toggle(v.id)}
                className="ml-1 hover:text-foreground"
              >
                <IconX className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
