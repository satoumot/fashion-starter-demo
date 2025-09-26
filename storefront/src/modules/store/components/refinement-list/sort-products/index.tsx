"use client"

import * as ReactAria from "react-aria-components"
import {
  UiSelectButton,
  UiSelectIcon,
  UiSelectListBox,
  UiSelectListBoxItem,
  UiSelectValue,
} from "@/components/ui/Select"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions | undefined
  setQueryParams: (name: string, value: SortOptions) => void
}

const SortProducts = ({ sortBy, setQueryParams }: SortProductsProps) => {
  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  return (
    <ReactAria.Select
      placeholder="並び替え"
      selectedKey={sortBy || "sortBy"}
      onSelectionChange={(key) => {
        handleChange(key as SortOptions)
      }}
      className="max-md:hidden"
      aria-label="Sort by"
    >
      <UiSelectButton>
        <UiSelectValue />
        <UiSelectIcon />
      </UiSelectButton>
      <ReactAria.Popover className="w-60" placement="bottom right">
        <UiSelectListBox>
          <UiSelectListBoxItem id="created_at">
            最新作
          </UiSelectListBoxItem>
          <UiSelectListBoxItem id="price_asc">値段昇順</UiSelectListBoxItem>
          <UiSelectListBoxItem id="price_desc">
            値段降順
          </UiSelectListBoxItem>
        </UiSelectListBox>
      </ReactAria.Popover>
    </ReactAria.Select>
  )
}

export default SortProducts
