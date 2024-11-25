const OrDivider = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        margin: '20px 0'
      }}
    >
      <div
        style={{
          flex: '1',
          height: '1px',
          backgroundColor: '#d9d9d9'
        }}
      ></div>
      <span
        className='has-text-white'
        style={{
          margin: '0 5px',
          fontSize: '1rem'
        }}
      > Or </span>
      <div
        style={{
          flex: '1',
          height: '1px',
          backgroundColor: '#d9d9d9'
        }}
      ></div>
    </div>
  );
}

export default OrDivider;
