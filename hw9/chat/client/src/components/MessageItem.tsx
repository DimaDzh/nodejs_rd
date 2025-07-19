import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, Typography } from '@mui/material';
import { MessageDTO, UserDTO } from '../lib/types';
import { format } from 'date-fns';

export const MessageItem = ({
                              msg, you, users,
                            }: {
  msg: MessageDTO;
  you: string;
  users: Record<string, UserDTO>;
}) => {
  const u = users[msg.author];
  const isMe = msg.author === you;

  return (
    <ListItem sx={{ flexDirection: isMe ? 'row-reverse' : 'row', gap:2}}>
      <ListItemAvatar sx={{ minWidth: 40 }}>
        <Avatar src={u?.iconUrl}>{u ? u.name[0].toUpperCase() : '?'}</Avatar>
      </ListItemAvatar>

      <ListItemText
        sx={{
          maxWidth: '70%',
          bgcolor: isMe ? 'primary.main' : 'grey.100',
          color: isMe ? '#fff' : 'inherit',
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
        primary={<Typography>{msg.text}</Typography>}
        secondary={<Typography variant="caption">{format(new Date(msg.sentAt), 'HH:mm')}</Typography>}
      />
    </ListItem>
  );
};