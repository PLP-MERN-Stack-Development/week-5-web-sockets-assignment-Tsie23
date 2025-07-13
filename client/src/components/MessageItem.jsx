function MessageItem({ msg }) {
  return (
    <div>
      {msg.system ? (
        <em>{msg.message}</em>
      ) : (
        <p>
          <strong>{msg.sender}:</strong> {msg.message}
        </p>
      )}
    </div>
  );
}
export default MessageItem;