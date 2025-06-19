import React from "react";

interface BookmarkIconProps extends React.SVGProps<SVGSVGElement> {
  checked?: boolean;
}

const BookmarkIcon: React.FC<BookmarkIconProps> = ({ checked = false, ...props }) => (
  checked ? (
    // Filled bookmark
    <svg width="24" height="24" viewBox="0 0 24 24" fill="orange" {...props}>
      <path d="M6 2a2 2 0 0 0-2 2v18l8-5.333L20 22V4a2 2 0 0 0-2-2H6z" />
    </svg>
  ) : (
    // Outlined bookmark
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="orange" strokeWidth="2" {...props}>
      <path d="M6 2a2 2 0 0 0-2 2v18l8-5.333L20 22V4a2 2 0 0 0-2-2H6z" />
    </svg>
  )
);

export default BookmarkIcon;
