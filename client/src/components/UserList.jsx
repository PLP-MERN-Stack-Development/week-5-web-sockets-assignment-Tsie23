function UserList({ users }) {
  return (
    <div>
      <h4>Online Users:</h4>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.username}</li>
        ))}
      </ul>
    </div>
  );
}
export default UserList;