import { JSX, ClassAttributes, AnchorHTMLAttributes } from "react"

export const A = (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLAnchorElement> & AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return <a className='text-blue-300 font-bold' {...props} />
}