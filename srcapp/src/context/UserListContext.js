import React from 'react';

// Context 생성
const UserListContext = React.createContext({
    userList: []
    ,
    setUserList: () => {}
});


export default UserListContext;
