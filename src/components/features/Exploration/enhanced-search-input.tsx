"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Search, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useTRPC } from "~/lib/trpc/client";

interface EnhancedSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onEnterPressed?: () => void;
}

interface UserSearchResult {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

export function EnhancedSearchInput({
  searchTerm,
  onSearchChange,
  placeholder,
  onEnterPressed,
}: EnhancedSearchInputProps) {
  const t = useTranslations("Exploration");
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  const [searchUsername, setSearchUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trpc = useTRPC();

  // Debounce the username search with 300ms delay
  const debouncedSearchUsername = useDebounce(searchUsername, 300);

  // Search users when @ symbol is detected, username is at least 2 characters, and debounced
  const { data: users = [], isLoading: isSearchingUsers } = useQuery({
    ...trpc.users.searchUsers.queryOptions({
      username: debouncedSearchUsername,
      limit: 8,
    }),
    enabled: showDropdown && debouncedSearchUsername.length >= 2,
    refetchOnWindowFocus: false,
  });

  // Handle input changes and detect @ symbol
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart || 0;

    onSearchChange(value);
    setCursorPosition(cursor);

    // Check for @ symbol and extract username search
    const beforeCursor = value.substring(0, cursor);
    const lastAtIndex = beforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Check if @ is at start or preceded by space
      const charBeforeAt =
        lastAtIndex > 0 ? beforeCursor[lastAtIndex - 1] : " ";
      if (charBeforeAt === " " || lastAtIndex === 0) {
        const afterAt = beforeCursor.substring(lastAtIndex + 1);
        // Check if there's no space after @
        if (!afterAt.includes(" ")) {
          setAtSymbolPosition(lastAtIndex);
          setSearchUsername(afterAt);
          setShowDropdown(true);
          return;
        }
      }
    }

    // Hide dropdown if no valid @ symbol context
    setShowDropdown(false);
    setAtSymbolPosition(-1);
    setSearchUsername("");
  };

  // Handle user selection from dropdown
  const handleUserSelect = (user: UserSearchResult) => {
    if (atSymbolPosition === -1 || !user.username) return;

    const beforeAt = searchTerm.substring(0, atSymbolPosition);
    const afterUsername = searchTerm.substring(cursorPosition);
    const newValue = `${beforeAt}@${user.username} ${afterUsername}`;

    onSearchChange(newValue);
    setShowDropdown(false);
    setAtSymbolPosition(-1);
    setSearchUsername("");

    // Focus back to input and position cursor after the inserted username
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeAt.length + user.username!.length + 2; // +2 for @ and space
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key - either select user from dropdown or close dialog
    if (e.key === "Enter") {
      e.preventDefault();

      if (
        showDropdown &&
        users &&
        users.length > 0 &&
        selectedIndex >= 0 &&
        selectedIndex < users.length
      ) {
        // Select user from dropdown
        const selectedUser = users[selectedIndex];
        if (selectedUser?.username) {
          handleUserSelect(selectedUser);
        }
      } else {
        // Close dialog when Enter is pressed without dropdown selection
        onEnterPressed?.();
      }
      return;
    }

    // Handle other keys only when dropdown is open
    if (!showDropdown || !users || users.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < users.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : users.length - 1));
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when dropdown shows/hides or users change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [showDropdown, users]);

  return (
    <div className="relative space-y-2">
      <Label className="text-lg font-medium" htmlFor="enhanced-search">
        <Search className="mr-2 inline-block h-5 w-5" />
        {t("search.label")}
      </Label>

      <div className="relative">
        <Input
          ref={inputRef}
          id="enhanced-search"
          placeholder={placeholder || t("search.enhanced-placeholder")}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
        />

        {/* User Search Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="bg-background border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border shadow-lg"
          >
            {searchUsername.length < 2 ? (
              <div className="text-muted-foreground p-3 text-sm">
                {t("search.min-chars-required", { count: 2 })}
              </div>
            ) : isSearchingUsers ? (
              <div className="text-muted-foreground p-3 text-sm">
                {t("search.searching-users")}
              </div>
            ) : users && users.length > 0 ? (
              <>
                <div className="text-muted-foreground border-border border-b p-2 text-xs">
                  {t("search.users-found", { count: users.length })}
                </div>
                {users.map((user, index) => {
                  if (!user.username) return null;

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`hover:bg-muted/50 flex w-full items-center gap-3 p-3 text-left transition-colors ${
                        index === selectedIndex ? "bg-muted" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.image || undefined}
                          alt={user.username || undefined}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">
                          {"@"}
                          {user.username}
                        </div>
                        {user.name && (
                          <div className="text-muted-foreground truncate text-sm">
                            {user.name}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            ) : debouncedSearchUsername.length >= 2 ? (
              <div className="text-muted-foreground p-3 text-sm">
                {t("search.no-users-found")}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-muted-foreground text-sm">{t("search.helper-text")}</p>
    </div>
  );
}
