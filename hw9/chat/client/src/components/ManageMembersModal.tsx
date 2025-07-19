import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Box } from '@mui/material';
import { SelectUsersModal } from './SelectUsersModal';

export const ManageMembersModal = ({
                                     members,
                                     me,
                                     onSave,
                                     onClose,
                                   }: {
  members: string[];
  me: string;
  onSave: (next: string[]) => void;
  onClose: () => void;
}) => {
  const [list, setList] = useState<string[]>(members);
  const [picker, setPicker] = useState(false);

  return (
    <>
      <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
        <DialogTitle>Chat members</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box display="flex" gap={1} flexWrap="wrap">
            {list.map((u) => (
              <Chip
                key={u}
                label={u}
                onDelete={u === me ? undefined : () => setList(list.filter((x) => x !== u))}
                color={u === me ? 'primary' : 'default'}
              />
            ))}
          </Box>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setPicker(true)}>
            Add / remove users
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={() => onSave(list)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {picker && (
        <SelectUsersModal
          open
          initial={list}
          onDone={(sel) => {
            setList(sel);
            setPicker(false);
          }}
          onClose={() => setPicker(false)}
        />
      )}
    </>
  );
};