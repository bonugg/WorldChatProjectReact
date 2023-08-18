const RequestedListItem = ({list}) => {
    const {id, user, friends, statement} = list;

    return (
        <tr>
            <td>{id}</td>
            <td>{user.userName}</td>
            <td>{friends.userName}</td>
            <td>{statement}</td>
        </tr>
    )
}

export default RequestedListItem;