import React from 'react';
import { Box, Typography } from '@mui/material';

export const TypingIndicator = ({user}: {user?: string}) => (
  <Box px={2} py={0.5}><Typography variant="caption" color="text.secondary">{user ?? 'Someone'} is typing…</Typography></Box>
);