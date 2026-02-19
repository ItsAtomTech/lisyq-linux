#ifndef PORTMANAGER_H
#define PORTMANAGER_H

#include <QObject>
#include <QMap>
#include <QSerialPort>
#include <QSerialPortInfo>
#include <QUdpSocket>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonDocument>

class PortManager : public QObject
{
    Q_OBJECT

public:
    explicit PortManager(QObject *parent = nullptr);

    // Serial
    void addSerialPort(int index, const QString &portName);
    void removeSerialPort(int index, bool keep);
    QString getSystemPortsJson();
    QString getManagedPortsJson();
    void sendToSerial(int index, const QString &data);

    // UDP
    void addUdpChannel(int index, const QString &address, quint16 port);
    void removeUdpChannel(int index);
    void sendUdp(int index, const QString &message);
    QString getUdpListJson();

signals:
    void notification(const QString &message, const QString &color);
    void serialDataReceived(int index, const QString &data);

private:
    QMap<int, QSerialPort*> serialPorts;
    QMap<int, QUdpSocket*> udpChannels;
};

#endif
