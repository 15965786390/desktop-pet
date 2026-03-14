import Cocoa

// Minimal global input watcher for macOS
// Outputs "K" for keydown, "M" for mousedown to stdout
// Requires Accessibility permission

func main() {
    // Disable stdout buffering
    setbuf(stdout, nil)

    let mask: CGEventMask = (1 << CGEventType.keyDown.rawValue) | (1 << CGEventType.leftMouseDown.rawValue) | (1 << CGEventType.rightMouseDown.rawValue)

    guard let tap = CGEvent.tapCreate(
        tap: .cgSessionEventTap,
        place: .headInsertEventTap,
        options: .listenOnly,
        eventsOfInterest: mask,
        callback: { (proxy, type, event, refcon) -> Unmanaged<CGEvent>? in
            switch type {
            case .keyDown:
                print("K")
            case .leftMouseDown, .rightMouseDown:
                print("M")
            default:
                break
            }
            return Unmanaged.passRetained(event)
        },
        userInfo: nil
    ) else {
        fputs("ERROR: Cannot create event tap. Grant Accessibility permission.\n", stderr)
        exit(1)
    }

    let runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
    CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
    CGEvent.tapEnable(tap: tap, enable: true)

    fputs("OK\n", stderr)
    CFRunLoopRun()
}

main()
