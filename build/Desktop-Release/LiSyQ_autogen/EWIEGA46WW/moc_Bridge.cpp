/****************************************************************************
** Meta object code from reading C++ file 'Bridge.h'
**
** Created by: The Qt Meta Object Compiler version 69 (Qt 6.10.2)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../../../../Bridge.h"
#include <QtCore/qmetatype.h>

#include <QtCore/qtmochelpers.h>

#include <memory>


#include <QtCore/qxptype_traits.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'Bridge.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 69
#error "This file was generated using the moc from 6.10.2. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

#ifndef Q_CONSTINIT
#define Q_CONSTINIT
#endif

QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
QT_WARNING_DISABLE_GCC("-Wuseless-cast")
namespace {
struct qt_meta_tag_ZN6BridgeE_t {};
} // unnamed namespace

template <> constexpr inline auto Bridge::qt_create_metaobjectdata<qt_meta_tag_ZN6BridgeE_t>()
{
    namespace QMC = QtMocConstants;
    QtMocHelpers::StringRefStorage qt_stringData {
        "Bridge",
        "put_data",
        "",
        "data",
        "Save_To_File",
        "AsNewTrigger",
        "Open_FileDirectory",
        "Open_File_LVjs",
        "Save_File_LVjs",
        "OpenSelectDirectory",
        "startAt",
        "SaveToFile",
        "path",
        "getCurrentPath",
        "removeOldBakFiles",
        "folder",
        "onReady",
        "add_comport",
        "index",
        "portname",
        "add_udpchannel",
        "address",
        "port",
        "get_udplist_json",
        "disconnect_udp",
        "get_comlist",
        "get_comports",
        "disconnect_com",
        "set_values",
        "outputs",
        "SendToComPort",
        "portName",
        "Show_content_menu",
        "Show_track_menu",
        "Show_template_menu",
        "Show_manual_template_menu",
        "set_toastMessage",
        "show_toast"
    };

    QtMocHelpers::UintData qt_methods {
        // Slot 'put_data'
        QtMocHelpers::SlotData<void(const QString &)>(1, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 3 },
        }}),
        // Slot 'Save_To_File'
        QtMocHelpers::SlotData<void()>(4, 2, QMC::AccessPublic, QMetaType::Void),
        // Slot 'AsNewTrigger'
        QtMocHelpers::SlotData<bool()>(5, 2, QMC::AccessPublic, QMetaType::Bool),
        // Slot 'Open_FileDirectory'
        QtMocHelpers::SlotData<bool()>(6, 2, QMC::AccessPublic, QMetaType::Bool),
        // Slot 'Open_File_LVjs'
        QtMocHelpers::SlotData<bool()>(7, 2, QMC::AccessPublic, QMetaType::Bool),
        // Slot 'Save_File_LVjs'
        QtMocHelpers::SlotData<bool()>(8, 2, QMC::AccessPublic, QMetaType::Bool),
        // Slot 'OpenSelectDirectory'
        QtMocHelpers::SlotData<QString()>(9, 2, QMC::AccessPublic, QMetaType::QString),
        // Slot 'OpenSelectDirectory'
        QtMocHelpers::SlotData<QString(const QString &)>(9, 2, QMC::AccessPublic, QMetaType::QString, {{
            { QMetaType::QString, 10 },
        }}),
        // Slot 'SaveToFile'
        QtMocHelpers::SlotData<bool(const QString &, const QString)>(11, 2, QMC::AccessPublic, QMetaType::Bool, {{
            { QMetaType::QString, 12 }, { QMetaType::QString, 3 },
        }}),
        // Slot 'getCurrentPath'
        QtMocHelpers::SlotData<QString()>(13, 2, QMC::AccessPublic, QMetaType::QString),
        // Slot 'removeOldBakFiles'
        QtMocHelpers::SlotData<void(const QString &)>(14, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 15 },
        }}),
        // Slot 'onReady'
        QtMocHelpers::SlotData<QString()>(16, 2, QMC::AccessPublic, QMetaType::QString),
        // Slot 'add_comport'
        QtMocHelpers::SlotData<bool(int, const QString &)>(17, 2, QMC::AccessPublic, QMetaType::Bool, {{
            { QMetaType::Int, 18 }, { QMetaType::QString, 19 },
        }}),
        // Slot 'add_udpchannel'
        QtMocHelpers::SlotData<bool(int, const QString &, int)>(20, 2, QMC::AccessPublic, QMetaType::Bool, {{
            { QMetaType::Int, 18 }, { QMetaType::QString, 21 }, { QMetaType::Int, 22 },
        }}),
        // Slot 'get_udplist_json'
        QtMocHelpers::SlotData<QString()>(23, 2, QMC::AccessPublic, QMetaType::QString),
        // Slot 'disconnect_udp'
        QtMocHelpers::SlotData<void(int)>(24, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::Int, 18 },
        }}),
        // Slot 'get_comlist'
        QtMocHelpers::SlotData<QString()>(25, 2, QMC::AccessPublic, QMetaType::QString),
        // Slot 'get_comports'
        QtMocHelpers::SlotData<QString()>(26, 2, QMC::AccessPublic, QMetaType::QString),
        // Slot 'disconnect_com'
        QtMocHelpers::SlotData<void(int)>(27, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::Int, 18 },
        }}),
        // Slot 'set_values'
        QtMocHelpers::SlotData<void(int, const QString &)>(28, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::Int, 22 }, { QMetaType::QString, 3 },
        }}),
        // Slot 'outputs'
        QtMocHelpers::SlotData<void()>(29, 2, QMC::AccessPublic, QMetaType::Void),
        // Slot 'SendToComPort'
        QtMocHelpers::SlotData<void(const QString &, const QString &)>(30, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 31 }, { QMetaType::QString, 3 },
        }}),
        // Slot 'Show_content_menu'
        QtMocHelpers::SlotData<void()>(32, 2, QMC::AccessPublic, QMetaType::Void),
        // Slot 'Show_track_menu'
        QtMocHelpers::SlotData<void()>(33, 2, QMC::AccessPublic, QMetaType::Void),
        // Slot 'Show_template_menu'
        QtMocHelpers::SlotData<void()>(34, 2, QMC::AccessPublic, QMetaType::Void),
        // Slot 'Show_manual_template_menu'
        QtMocHelpers::SlotData<void()>(35, 2, QMC::AccessPublic, QMetaType::Void),
        // Slot 'set_toastMessage'
        QtMocHelpers::SlotData<void(const QString &)>(36, 2, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 3 },
        }}),
        // Slot 'show_toast'
        QtMocHelpers::SlotData<void()>(37, 2, QMC::AccessPublic, QMetaType::Void),
    };
    QtMocHelpers::UintData qt_properties {
    };
    QtMocHelpers::UintData qt_enums {
    };
    return QtMocHelpers::metaObjectData<Bridge, qt_meta_tag_ZN6BridgeE_t>(QMC::MetaObjectFlag{}, qt_stringData,
            qt_methods, qt_properties, qt_enums);
}
Q_CONSTINIT const QMetaObject Bridge::staticMetaObject = { {
    QMetaObject::SuperData::link<QObject::staticMetaObject>(),
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN6BridgeE_t>.stringdata,
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN6BridgeE_t>.data,
    qt_static_metacall,
    nullptr,
    qt_staticMetaObjectRelocatingContent<qt_meta_tag_ZN6BridgeE_t>.metaTypes,
    nullptr
} };

void Bridge::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    auto *_t = static_cast<Bridge *>(_o);
    if (_c == QMetaObject::InvokeMetaMethod) {
        switch (_id) {
        case 0: _t->put_data((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 1: _t->Save_To_File(); break;
        case 2: { bool _r = _t->AsNewTrigger();
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 3: { bool _r = _t->Open_FileDirectory();
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 4: { bool _r = _t->Open_File_LVjs();
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 5: { bool _r = _t->Save_File_LVjs();
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 6: { QString _r = _t->OpenSelectDirectory();
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 7: { QString _r = _t->OpenSelectDirectory((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1])));
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 8: { bool _r = _t->SaveToFile((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<QString>>(_a[2])));
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 9: { QString _r = _t->getCurrentPath();
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 10: _t->removeOldBakFiles((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 11: { QString _r = _t->onReady();
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 12: { bool _r = _t->add_comport((*reinterpret_cast<std::add_pointer_t<int>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<QString>>(_a[2])));
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 13: { bool _r = _t->add_udpchannel((*reinterpret_cast<std::add_pointer_t<int>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<QString>>(_a[2])),(*reinterpret_cast<std::add_pointer_t<int>>(_a[3])));
            if (_a[0]) *reinterpret_cast<bool*>(_a[0]) = std::move(_r); }  break;
        case 14: { QString _r = _t->get_udplist_json();
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 15: _t->disconnect_udp((*reinterpret_cast<std::add_pointer_t<int>>(_a[1]))); break;
        case 16: { QString _r = _t->get_comlist();
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 17: { QString _r = _t->get_comports();
            if (_a[0]) *reinterpret_cast<QString*>(_a[0]) = std::move(_r); }  break;
        case 18: _t->disconnect_com((*reinterpret_cast<std::add_pointer_t<int>>(_a[1]))); break;
        case 19: _t->set_values((*reinterpret_cast<std::add_pointer_t<int>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<QString>>(_a[2]))); break;
        case 20: _t->outputs(); break;
        case 21: _t->SendToComPort((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<QString>>(_a[2]))); break;
        case 22: _t->Show_content_menu(); break;
        case 23: _t->Show_track_menu(); break;
        case 24: _t->Show_template_menu(); break;
        case 25: _t->Show_manual_template_menu(); break;
        case 26: _t->set_toastMessage((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 27: _t->show_toast(); break;
        default: ;
        }
    }
}

const QMetaObject *Bridge::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *Bridge::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_staticMetaObjectStaticContent<qt_meta_tag_ZN6BridgeE_t>.strings))
        return static_cast<void*>(this);
    return QObject::qt_metacast(_clname);
}

int Bridge::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QObject::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 28)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 28;
    }
    if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 28)
            *reinterpret_cast<QMetaType *>(_a[0]) = QMetaType();
        _id -= 28;
    }
    return _id;
}
QT_WARNING_POP
