// Type declarations to fix React 19 compatibility issues

declare module 'react-icons/io5' {
    import { FC, SVGProps } from 'react';

    interface IconProps extends SVGProps<SVGSVGElement> {
        size?: number | string;
    }

    export const IoLocationSharp: FC<IconProps>;
    export const IoStar: FC<IconProps>;
    export const IoCallOutline: FC<IconProps>;
    export const IoNavigateOutline: FC<IconProps>;
    export const IoPricetag: FC<IconProps>;
    export const IoMedicalOutline: FC<IconProps>;
}

declare module 'react-icons/fa' {
    import { FC, SVGProps } from 'react';

    interface IconProps extends SVGProps<SVGSVGElement> {
        size?: number | string;
    }

    // Existing icons
    export const FaChevronLeft: FC<IconProps>;
    export const FaChevronRight: FC<IconProps>;
    export const FaMapMarkerAlt: FC<IconProps>;
    export const FaDumbbell: FC<IconProps>;
    export const FaStar: FC<IconProps>;
    export const FaClock: FC<IconProps>;
    export const FaCheckCircle: FC<IconProps>;
    export const FaPhoneAlt: FC<IconProps>;

    // Missing icons from error messages
    export const FaTimes: FC<IconProps>;
    export const FaArrowLeft: FC<IconProps>;
    export const FaSearch: FC<IconProps>;
    export const FaMicrophone: FC<IconProps>;
    export const FaUser: FC<IconProps>;
    export const FaUserTie: FC<IconProps>;
}
