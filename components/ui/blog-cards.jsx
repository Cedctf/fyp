const BlogCard = ({ title, date, description, isActive }) => {
    return (
        <div
            className='w-full h-auto py-4 px-0 blog-card group hover:cursor-pointer transition-all duration-500 ease-out'>
            <div className='flex justify-start gap-4 items-end relative group-hover:translate-x-2 transition-transform duration-300 ease-out'>
                <div
                    className={`md:text-2xl text-xl font-serif font-bold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[rgb(27,55,121)]' : 'text-black/50 group-hover:text-[rgb(27,55,121)]'}`}>{title}</div>
                <span
                    className={`flex-grow border-b-[1px] mb-[6px] transition-colors duration-300 ${isActive ? 'border-[rgb(27,55,121)]' : 'border-neutral-200 group-hover:border-[rgb(27,55,121)]'}`}></span>
                <div
                    className={`whitespace-nowrap uppercase font-mono md:text-sm text-[10px] mb-[2px] transition-colors duration-300 ${isActive ? 'text-[rgb(27,55,121)]' : 'text-black group-hover:text-[rgb(27,55,121)]'}`}>{date}</div>
            </div>
            <div
                className={`md:text-sm text-xs mt-1 md:max-w-xl max-w-sm font-sans group-hover:translate-x-2 transition-all duration-300 ease-out delay-75 ${isActive ? 'text-[rgb(27,55,121)]' : 'text-neutral-500 group-hover:text-[rgb(27,55,121)]'}`}>{description}</div>
        </div>
    );
}

export default BlogCard