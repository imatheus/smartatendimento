import { Box, Chip, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { darkenColor, getContrastColor } from "../../utils/colorGenerator";

export function UsersFilter({ onFiltered, initialUsers }) {
  const [users, setUsers] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadUsers();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelecteds([]);
    if (
      Array.isArray(initialUsers) &&
      Array.isArray(users) &&
      users.length > 0
    ) {
      onChange(initialUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUsers, users]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get(`/users/list`);
      const userList = data.map((u) => ({ id: u.id, name: u.name }));
      setUsers(userList);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value) => {
    setSelecteds(value);
    onFiltered(value);
  };

  return (
    <Box style={{ padding: "0px 10px 10px" }}>
      <Autocomplete
        multiple
        size="small"
        options={users}
        value={selecteds}
        onChange={(e, v, r) => onChange(v)}
        getOptionLabel={(option) => option.name}
        getOptionSelected={(option, value) => {
          return (
            option?.id === value?.id ||
            option?.name.toLowerCase() === value?.name.toLowerCase()
          );
        }}
        renderTags={(value, getUserProps) => {
          return value.map((option, index) => {
            const backgroundColor = darkenColor('#bfbfbf', 0.2);
            const textColor = getContrastColor(backgroundColor);
            return (
              <Chip
                variant="outlined"
                style={{
                  backgroundColor: backgroundColor,
                  color: textColor,
                  border: `1px solid ${darkenColor(backgroundColor, 0.1)}`
                }}
                label={option.name}
                {...getUserProps({ index })}
                size="small"
              />
            );
          });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Filtro por Users"
          />
        )}
      />
    </Box>
  );
}
