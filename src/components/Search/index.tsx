import { ChangeEventHandler, KeyboardEventHandler, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, IconButton, InputBase, Modal, Tooltip } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import * as Mousetrap from 'mousetrap';
import { formatShortcutForDisplay, getSearchShortcutRecording, isReservedSearchShortcut, normalizeStoredSearchShortcut } from "../../utils/searchShortcut";

type SearchBoxProps = {
  search: string,
  searchShortcut: string,
  onSearch: (text: string) => void,
  onSubmit?: () => void,
}

export function Search({ search, searchShortcut, onSearch, onSubmit }: SearchBoxProps) {
  const { t } = useTranslation();
  const [showSpotlight, setShowSpotlight] = useState(false);
  const showRef = useRef(showSpotlight);
  const searchRef = useRef(search);
  const onSearchRef = useRef(onSearch);
  const onSubmitRef = useRef(onSubmit);
  const normalizedShortcut = normalizeStoredSearchShortcut(searchShortcut);
  const searchTooltip = normalizedShortcut === 'ctrl+f'
    ? t('Search (Ctrl+F)')
    : t('Search (Ctrl+F, {{shortcut}})', { shortcut: formatShortcutForDisplay(normalizedShortcut) });

  useEffect(() => {
    showRef.current = showSpotlight;
  }, [showSpotlight]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const openSpotlight = (clearSearch: boolean = false) => {
    setShowSpotlight(true);
    if (clearSearch) {
      onSearchRef.current('');
    }
  };

  const closeSpotlight = () => {
    setShowSpotlight(false);
  };

  const cancelSearch = () => {
    setShowSpotlight(false);
    onSearchRef.current('');
  };

  useEffect(() => {
    // Quick search shortcuts
    Mousetrap.bind('ctrl+f', () => {
      if (getSearchShortcutRecording()) {
        return true;
      }
      openSpotlight(true);
      return false;
    });

    Mousetrap.bind('esc', () => {
      if (getSearchShortcutRecording()) {
        return true;
      }
      if (showRef.current || searchRef.current.length > 0) {
        cancelSearch();
        return false;
      }
      return true;
    }, 'keydown');

    return () => {
      Mousetrap.unbind('ctrl+f');
      Mousetrap.unbind(normalizedShortcut);
      Mousetrap.unbind('esc');
    }
  }, [normalizedShortcut]);

  useEffect(() => {
    if (normalizedShortcut === 'ctrl+f' || isReservedSearchShortcut(normalizedShortcut)) {
      return;
    }

    Mousetrap.unbind(normalizedShortcut);

    Mousetrap.bind(normalizedShortcut, () => {
      if (getSearchShortcutRecording()) {
        return true;
      }
      openSpotlight(true);
      return false;
    });

    return () => {
      Mousetrap.unbind(normalizedShortcut);
    }
  }, [normalizedShortcut]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onSearch(e.currentTarget.value);
  }

  const handleSpotlightKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      closeSpotlight();
      onSubmitRef.current?.();
    }
  }

  return <>
    {(showSpotlight || search.length > 0) && (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          width: '25ch',
          mr: 1,
          px: 0.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <InputBase
          type="text"
          value={search}
          onChange={handleChange}
          placeholder={t("Search")}
          inputProps={{ className: 'mousetrap' }}
          sx={{
            width: '100%',
            color: '#fff',
            fontSize: '0.95rem',
          }}
        />
      </Box>
    )}

    <Tooltip title={searchTooltip} arrow>
      <IconButton onClick={() => openSpotlight(false)}>
        <SearchIcon />
      </IconButton>
    </Tooltip>

    <Modal
      open={showSpotlight}
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') {
          cancelSearch();
          return;
        }
        closeSpotlight();
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '88vw', sm: 480 },
          borderRadius: 1.5,
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 24,
          p: { xs: 1.25, sm: 1.5 },
          outline: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 24 }} />
          <InputBase
            type="text"
            value={search}
            onChange={handleChange}
            onKeyDown={handleSpotlightKeyDown}
            placeholder={t("Search")}
            inputProps={{ className: 'mousetrap' }}
            autoFocus
            sx={{
              flex: 1,
              color: '#fff',
              fontSize: { xs: '1.05rem', sm: '1.2rem' },
              lineHeight: 1.3,
            }}
          />
        </Box>
      </Box>
    </Modal>
  </>
}
